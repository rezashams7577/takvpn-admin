"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminListShell } from "@/components/admin/AdminListShell";
import { adminListAudit, type AuditLogEntry } from "@/lib/admin-api";

function formatAuditDetails(meta: unknown, t: (key: string, values?: Record<string, string | number>) => string): string {
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
    <div>
      <h1 className="text-2xl font-bold">{t("audit")}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setAction("wallet.adjustment");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-sm border ${
            action === "wallet.adjustment" ? "bg-brand-600 text-white border-brand-600" : ""
          }`}
        >
          {t("auditFilterWallet")}
        </button>
        <button
          type="button"
          onClick={() => {
            setAction("");
            setEntityId("");
            setEntityType("");
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-lg text-sm border"
        >
          Clear filters
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by action"
          className="w-full max-w-sm rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={entityId}
          onChange={(e) => {
            setEntityId(e.target.value);
            setPage(1);
          }}
          placeholder="Entity ID (customer)"
          className="w-40 rounded-lg border px-3 py-2 text-sm"
          dir="ltr"
        />
        <input
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
          placeholder="Entity type"
          className="w-40 rounded-lg border px-3 py-2 text-sm"
          dir="ltr"
        />
      </div>
      <p className="text-sm text-[var(--muted)] mt-2">{total} entries</p>
      <AdminListShell loading={loading} error={err} empty={!loading && !err && items.length === 0}>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b text-left text-[var(--muted)]">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">{t("auditActor")}</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Entity</th>
                <th className="py-2 pr-4">{t("auditDetails")}</th>
                <th className="py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => {
                let meta: unknown;
                try {
                  meta =
                    typeof e.meta === "string"
                      ? JSON.parse(e.meta)
                      : e.meta;
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
                  <tr key={e.id} className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">{e.customer_id || "—"}</td>
                    <td className="py-3 pr-4">{e.action}</td>
                    <td className="py-3 pr-4">
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
                    </td>
                    <td className="py-3 pr-4 max-w-md text-[var(--muted)]">{details}</td>
                    <td className="py-3">{e.ip_address || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm py-1">
            {t("page")} {page}
          </span>
          <button
            disabled={items.length < 50}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </AdminListShell>
    </div>
  );
}
