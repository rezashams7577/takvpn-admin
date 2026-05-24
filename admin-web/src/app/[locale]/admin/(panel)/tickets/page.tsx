"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminListShell } from "@/components/admin/AdminListShell";
import { createTicketSocket } from "@/lib/ticket-socket";
import { adminListTickets, type Ticket } from "@/lib/tickets";

type Tab = "open" | "claimed" | "closed" | "all";

export default function AdminTicketsPage() {
  const t = useTranslations("adminPanel");
  const [tab, setTab] = useState<Tab>("open");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [connected, setConnected] = useState(false);
  const [connectionFailed, setConnectionFailed] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setErr("");
    adminListTickets(tab)
      .then(setTickets)
      .catch((e) => setErr(e instanceof Error ? e.message : t("failed")))
      .finally(() => setLoading(false));
  }, [tab, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sock = createTicketSocket({
      onOpen: () => {
        setConnected(true);
        setConnectionFailed(false);
      },
      onClose: () => setConnected(false),
      onError: () => setConnected(false),
      onConnectionFailed: () => setConnectionFailed(true),
      onEvent: (ev) => {
        if (
          ev.type === "ticket.created" ||
          ev.type === "ticket.unclaimed" ||
          ev.type === "ticket.claimed" ||
          ev.type === "ticket.closed"
        ) {
          load();
        }
      },
    });
    return () => sock.close();
  }, [load]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "open", label: t("ticketsOpen") },
    { id: "claimed", label: t("ticketsClaimed") },
    { id: "closed", label: t("ticketsClosed") },
    { id: "all", label: t("ticketsAll") },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("ticketsTitle")}</h1>
        <span
          className={`text-xs ${
            connected
              ? "text-green-600"
              : connectionFailed
                ? "text-red-600"
                : "text-amber-600"
          }`}
        >
          {connected
            ? t("ticketConnected")
            : connectionFailed
              ? t("ticketWsFailed")
              : t("ticketDisconnected")}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === x.id
                ? "bg-brand-600 text-white"
                : "border border-[var(--border)]"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <AdminListShell loading={loading} error={err} empty={!loading && !err && tickets.length === 0}>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[var(--muted)]">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">{t("ticketCustomer")}</th>
                <th className="py-2 pr-4">{t("ticketSubject")}</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2">{t("view")}</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((tk) => (
                <tr key={tk.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4">#{tk.id}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/users/${tk.customer_id}`} className="text-brand-600">
                      {tk.customer_email}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{tk.subject}</td>
                  <td className="py-3 pr-4">{tk.status}</td>
                  <td className="py-3 pr-4">
                    {new Date(tk.last_message_at).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <Link href={`/admin/tickets/${tk.id}`} className="text-brand-600">
                      {t("view")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminListShell>
    </div>
  );
}
