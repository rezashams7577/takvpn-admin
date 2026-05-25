"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { adminListAudit, type AuditLogEntry } from "@/lib/admin-api";

const inputClass =
  "rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)]";

function formatAuditDetails(
  meta: unknown,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  if (!meta || typeof meta !== "object") return "—";
  const m = meta as Record<string, unknown>;
  if (m.direction || m.currency) {
    const currency = String(m.currency ?? "");
    const amount = String(m.amount ?? "");
    const direction = String(m.direction ?? "");
    const note = String(m.note ?? "");
    const target =
      m.target_customer_id != null
        ? t("auditTargetCustomer", { id: Number(m.target_customer_id) })
        : m.customer_id != null
          ? t("auditTargetCustomer", { id: Number(m.customer_id) })
          : "";
    const sign = direction === "debit" ? "−" : "+";
    const parts = [`${currency} ${sign}${amount}`.trim()];
    if (target) parts.push(target);
    if (note) parts.push(note);
    return parts.join(" · ");
  }
  try {
    return JSON.stringify(meta);
  } catch {
    return "—";
  }
}

export default function AdminAuditPage() {
  const t = useTranslations("adminPanel");
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action") ?? "";
  const initialEntityId = searchParams.get("entity_id") ?? "";
  const initialEntityType = searchParams.get("entity_type") ?? "";

  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(initialAction);
  const [entityId, setEntityId] = useState(initialEntityId);
  const [entityType, setEntityType] = useState(initialEntityType);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    setErr("");
    const eid = entityId ? parseInt(entityId, 10) : undefined;
    adminListAudit(page, action, {
      entity_id: eid && !Number.isNaN(eid) ? eid : undefined,
      entity_type: entityType || undefined,
    })
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [page, action, entityId, entityType]);

  return (
    <AdminPage className="max-w-5xl">
      <PanelPageHeader title={t("audit")} />

      <PanelSection title={t("audit")}>
        <div className="flex flex-wrap gap-2 mb-4">
          <AdminButton
            variant={action === "wallet.adjustment" ? "primary" : "secondary"}
            onClick={() => {
              setAction("wallet.adjustment");
              setPage(1);
            }}
          >
            {t("auditFilterWallet")}
          </AdminButton>
          <AdminButton
            variant="secondary"
            onClick={() => {
              setAction("");
              setEntityId("");
              setEntityType("");
              setPage(1);
            }}
          >
            Clear filters
          </AdminButton>
        </div>

        <div className="admin-form flex flex-wrap gap-3 mb-4" dir="ltr">
          <input
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by action"
            className={`w-full max-w-sm ${inputClass}`}
          />
          <input
            value={entityId}
            onChange={(e) => {
              setEntityId(e.target.value);
              setPage(1);
            }}
            placeholder="Entity ID (customer)"
            className={`w-40 ${inputClass}`}
          />
          <input
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            placeholder="Entity type"
            className={`w-40 ${inputClass}`}
          />
        </div>

        <p className="text-sm text-[var(--muted)] mb-4">{total} entries</p>

        <AdminListShell loading={loading} error={err} empty={!loading && !err && items.length === 0}>
          <AdminDataTable minWidth="720px">
            <AdminTableHead>
              <AdminTableTh>Time</AdminTableTh>
              <AdminTableTh>{t("auditActor")}</AdminTableTh>
              <AdminTableTh>Action</AdminTableTh>
              <AdminTableTh>Entity</AdminTableTh>
              <AdminTableTh>{t("auditDetails")}</AdminTableTh>
              <AdminTableTh>IP</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {items.map((e) => {
                let meta: unknown;
                try {
                  meta =
                    typeof e.meta === "string" ? JSON.parse(e.meta) : e.meta;
                } catch {
                  meta = e.meta;
                }
                const details =
                  e.action === "wallet.adjustment"
                    ? formatAuditDetails(meta, t)
                    : meta
                      ? typeof meta === "string"
                        ? meta
                        : JSON.stringify(meta)
                      : "—";
                return (
                  <AdminTableRow key={e.id}>
                    <AdminTableTd>
                      <span dir="ltr" className="inline-block whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                    </AdminTableTd>
                    <AdminTableTd>{e.customer_id || "—"}</AdminTableTd>
                    <AdminTableTd>{e.action}</AdminTableTd>
                    <AdminTableTd>
                      {e.entity_type === "customer" && e.entity_id ? (
                        <Link
                          href={`/admin/users/${e.entity_id}`}
                          className="text-brand-600"
                        >
                          {e.entity_type} #{e.entity_id}
                        </Link>
                      ) : (
                        <>
                          {e.entity_type} #{e.entity_id}
                        </>
                      )}
                    </AdminTableTd>
                    <AdminTableTd className="max-w-md text-[var(--muted)]">
                      {details}
                    </AdminTableTd>
                    <AdminTableTd>{e.ip_address || "—"}</AdminTableTd>
                  </AdminTableRow>
                );
              })}
            </AdminTableBody>
          </AdminDataTable>

          <div className="mt-4 flex gap-2">
            <AdminButton
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </AdminButton>
            <span className="text-sm py-2 text-[var(--muted)]">
              {t("page")} {page}
            </span>
            <AdminButton
              variant="secondary"
              disabled={items.length < 50}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </AdminButton>
          </div>
        </AdminListShell>
      </PanelSection>
    </AdminPage>
  );
}
