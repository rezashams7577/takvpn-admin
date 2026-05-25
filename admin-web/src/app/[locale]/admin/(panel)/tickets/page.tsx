"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  AdminButton,
  AdminDataTable,
  AdminListShell,
  AdminPage,
  AdminTableBody,
  AdminTableHead,
  AdminTableRow,
  AdminTableTd,
  AdminTableTh,
} from "@/components/admin";
import { PanelPageHeader, PanelSection } from "@/components/layout";
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

  const connectionColor = connected
    ? "text-[var(--success)]"
    : connectionFailed
      ? "text-[var(--danger)]"
      : "text-[var(--warning)]";

  return (
    <AdminPage className="max-w-5xl">
      <PanelPageHeader
        title={t("ticketsTitle")}
        description={
          <span className={connectionColor}>
            {connected
              ? t("ticketConnected")
              : connectionFailed
                ? t("ticketWsFailed")
                : t("ticketDisconnected")}
          </span>
        }
      />
      <PanelSection title={t("ticketsTitle")}>
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((x) => (
            <AdminButton
              key={x.id}
              variant={tab === x.id ? "primary" : "secondary"}
              onClick={() => setTab(x.id)}
            >
              {x.label}
            </AdminButton>
          ))}
        </div>
        <AdminListShell loading={loading} error={err} empty={!loading && !err && tickets.length === 0}>
          <AdminDataTable>
            <AdminTableHead>
              <AdminTableTh>ID</AdminTableTh>
              <AdminTableTh>{t("ticketCustomer")}</AdminTableTh>
              <AdminTableTh>{t("ticketSubject")}</AdminTableTh>
              <AdminTableTh>Status</AdminTableTh>
              <AdminTableTh>Updated</AdminTableTh>
              <AdminTableTh>{t("view")}</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {tickets.map((tk) => (
                <AdminTableRow key={tk.id}>
                  <AdminTableTd>#{tk.id}</AdminTableTd>
                  <AdminTableTd>
                    <Link href={`/admin/users/${tk.customer_id}`} className="text-brand-600">
                      {tk.customer_email}
                    </Link>
                  </AdminTableTd>
                  <AdminTableTd>{tk.subject}</AdminTableTd>
                  <AdminTableTd>{tk.status}</AdminTableTd>
                  <AdminTableTd>
                    <span dir="ltr" className="inline-block whitespace-nowrap">
                      {new Date(tk.last_message_at).toLocaleString()}
                    </span>
                  </AdminTableTd>
                  <AdminTableTd>
                    <Link href={`/admin/tickets/${tk.id}`} className="text-brand-600">
                      {t("view")}
                    </Link>
                  </AdminTableTd>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminDataTable>
        </AdminListShell>
      </PanelSection>
    </AdminPage>
  );
}
