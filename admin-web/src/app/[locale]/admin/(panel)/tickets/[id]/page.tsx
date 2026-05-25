"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  AdminButton,
  AdminPage,
} from "@/components/admin";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import {
  FormField,
  FormFile,
  FormMessage,
  FormSubmit,
} from "@/components/forms";
import { fetchMe } from "@/lib/api";
import { createTicketSocket } from "@/lib/ticket-socket";
import {
  adminClaimTicket,
  adminCloseTicket,
  adminGetTicket,
  adminSendTicketMessage,
  ticketAttachmentUrl,
  TicketApiError,
  type Ticket,
  type TicketMessage,
} from "@/lib/tickets";

export default function AdminTicketThreadPage() {
  const t = useTranslations("adminPanel");
  const params = useParams();
  const ticketId = Number(params.id);
  const [myId, setMyId] = useState<number | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const socketRef = useRef<ReturnType<typeof createTicketSocket> | null>(null);
  const claimTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await adminGetTicket(ticketId);
      setTicket(data.ticket);
      setMessages(data.messages);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("failed"));
    }
  }, [ticketId, t]);

  const clearClaimTimeout = useCallback(() => {
    if (claimTimeoutRef.current) {
      clearTimeout(claimTimeoutRef.current);
      claimTimeoutRef.current = null;
    }
  }, []);

  const finishClaiming = useCallback(() => {
    clearClaimTimeout();
    setClaiming(false);
  }, [clearClaimTimeout]);

  useEffect(() => {
    fetchMe().then((me) => setMyId(me.id)).catch(() => {});
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const sock = createTicketSocket({
      onOpen: () => {
        setConnected(true);
        setConnectionFailed(false);
        sock.subscribe(ticketId);
      },
      onClose: () => setConnected(false),
      onError: () => setConnected(false),
      onConnectionFailed: () => setConnectionFailed(true),
      onEvent: (ev) => {
        if (ev.type === "error") {
          setErr(ev.error || t("failed"));
          finishClaiming();
          return;
        }
        if (ev.type === "ticket.claim_failed") {
          setMsg("");
          setErr(t("ticketClaimFailed"));
          finishClaiming();
          void load();
          return;
        }
        if (ev.type === "ticket.claimed" && ev.ticket.id === ticketId) {
          setTicket(ev.ticket);
          finishClaiming();
          setErr("");
          setMsg(t("ticketClaimedByYou"));
        }
        if (ev.type === "ticket.message" && ev.ticket.id === ticketId) {
          setTicket(ev.ticket);
          setMessages((prev) => {
            if (prev.some((m) => m.id === ev.message.id)) return prev;
            return [...prev, ev.message];
          });
        }
        if (
          (ev.type === "ticket.unclaimed" || ev.type === "ticket.closed") &&
          ev.ticket.id === ticketId
        ) {
          setTicket(ev.ticket);
        }
      },
    });
    socketRef.current = sock;
    return () => {
      clearClaimTimeout();
      sock.close();
    };
  }, [ticketId, t, load, finishClaiming, clearClaimTimeout]);

  async function claimViaRest() {
    try {
      const tk = await adminClaimTicket(ticketId);
      setTicket(tk);
      setErr("");
      setMsg(t("ticketClaimedByYou"));
    } catch (ex) {
      if (ex instanceof TicketApiError && ex.status === 409) {
        setErr(t("ticketClaimFailed"));
      } else {
        setErr(ex instanceof Error ? ex.message : t("failed"));
      }
      await load();
    } finally {
      finishClaiming();
    }
  }

  async function onClaim() {
    setClaiming(true);
    setErr("");
    setMsg("");
    clearClaimTimeout();
    claimTimeoutRef.current = setTimeout(() => {
      setErr(t("ticketClaimTimeout"));
      finishClaiming();
    }, 10000);

    const sock = socketRef.current;
    if (sock?.isOpen()) {
      const sent = sock.claim(ticketId);
      if (!sent) {
        await claimViaRest();
      }
      return;
    }
    await claimViaRest();
  }

  const canReply =
    ticket?.status === "claimed" && myId != null && ticket.claimed_by === myId;
  const claimedByOther =
    ticket?.status === "claimed" && myId != null && ticket.claimed_by !== myId;

  async function onReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canReply) return;
    setSubmitting(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await adminSendTicketMessage(ticketId, fd);
      setTicket(res.ticket);
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });
      (e.target as HTMLFormElement).reset();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onClose() {
    try {
      const tk = await adminCloseTicket(ticketId);
      setTicket(tk);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    }
  }

  if (!ticket) {
    return <p className="text-sm text-[var(--muted)]">{err || t("loading")}</p>;
  }

  const otherName =
    ticket.claimed_by_name || ticket.claimed_by_email || `#${ticket.claimed_by}`;

  const connectionColor = connected
    ? "text-[var(--success)]"
    : connectionFailed
      ? "text-[var(--danger)]"
      : "text-[var(--warning)]";

  return (
    <AdminPage className="max-w-4xl">
      <Link href="/admin/tickets" className="text-sm text-brand-600">
        {t("ticketBack")}
      </Link>
      <PanelPageHeader
        title={ticket.subject}
        description={
          <>
            #{ticket.id} ·{" "}
            <Link href={`/admin/users/${ticket.customer_id}`} className="text-brand-600">
              {ticket.customer_email}
            </Link>
            {" · "}
            <span className={connectionColor}>
              {connected
                ? t("ticketConnected")
                : connectionFailed
                  ? t("ticketWsFailed")
                  : t("ticketDisconnected")}
            </span>
          </>
        }
      />

      {connectionFailed && (
        <p className="text-xs text-[var(--warning)]">{t("ticketWsFallbackHint")}</p>
      )}

      <PanelSection title={t("tickets")}>
        {ticket.status === "open" && (
          <AdminButton onClick={onClaim} disabled={claiming}>
            {claiming ? t("ticketClaiming") : t("ticketClaim")}
          </AdminButton>
        )}
        {claimedByOther && (
          <p className="text-sm text-[var(--warning)]">
            {t("ticketClaimedByOther", { name: otherName })}
          </p>
        )}
        {canReply && (
          <p className="text-sm text-[var(--success)]">{t("ticketClaimedByYou")}</p>
        )}

        <div className="mt-4 space-y-3 max-h-[28rem] overflow-y-auto rounded-xl border border-[var(--border)] p-4 bg-[var(--bg)]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                m.sender_role === "staff"
                  ? "ms-auto bg-brand-600 text-white"
                  : "me-auto bg-[var(--border)]"
              }`}
            >
              {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
              {m.has_attachment && (
                <a
                  href={ticketAttachmentUrl(ticketId, m.id, true)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-xs mt-1 block"
                >
                  {m.attachment_name || "Attachment"}
                </a>
              )}
              <p className="text-[10px] opacity-70 mt-1" dir="ltr">
                {m.sender_email} · {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {ticket.status !== "closed" && (
          <form
            onSubmit={onReply}
            className="admin-form max-w-xl space-y-3 mt-6"
            dir="ltr"
          >
            {!canReply && ticket.status !== "open" && (
              <p className="text-sm text-[var(--muted)]">{t("ticketMustClaim")}</p>
            )}
            <FormField name="body" label={t("ticketMessage")} multiline />
            <FormFile name="attachment" label={t("ticketAttachment")} accept="image/*,.pdf" />
            {msg && <FormMessage variant="success">{msg}</FormMessage>}
            {err && <FormMessage variant="error">{err}</FormMessage>}
            <div className="flex flex-wrap gap-3">
              <FormSubmit loading={submitting} disabled={!canReply}>
                {t("ticketReply")}
              </FormSubmit>
              <AdminButton variant="secondary" type="button" onClick={onClose}>
                {t("ticketClose")}
              </AdminButton>
            </div>
          </form>
        )}
      </PanelSection>
    </AdminPage>
  );
}
