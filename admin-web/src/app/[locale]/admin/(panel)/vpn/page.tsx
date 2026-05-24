"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminListShell } from "@/components/admin/AdminListShell";
import { useAdminRole } from "@/components/admin/AdminRoleContext";
import { adminListVPN, adminReprovisionVPN, type VPNServiceAdmin } from "@/lib/admin-api";

export default function AdminVPNPage() {
  const t = useTranslations("adminPanel");
  const role = useAdminRole();
  const canReprovision = role === "admin" || role === "super_admin";
  const [list, setList] = useState<VPNServiceAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [actionErr, setActionErr] = useState("");

  function load() {
    setLoading(true);
    setLoadErr("");
    adminListVPN(status)
      .then(setList)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [status]);

  async function reprovision(id: number) {
    try {
      await adminReprovisionVPN(id);
      setMsg(`Reprovision queued for #${id}`);
      load();
    } catch (e) {
      setActionErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("vpn")}</h1>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="admin-select mt-4"
      >
        <option value="">All statuses</option>
        <option value="provisioning">Provisioning</option>
        <option value="active">Active</option>
        <option value="failed">Failed</option>
        <option value="expired">Expired</option>
      </select>
      {msg && <p className="mt-4 text-sm text-green-600">{msg}</p>}
      {actionErr && <p className="mt-2 text-sm text-red-600">{actionErr}</p>}
      <AdminListShell
        loading={loading}
        error={loadErr}
        empty={!loading && !loadErr && list.length === 0}
      >
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b text-left text-[var(--muted)]">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">{t("comment")}</th>
                <th className="py-2 pr-4">{t("publicKey")}</th>
                <th className="py-2 pr-4">Expires</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => (
                <tr key={v.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4">{v.id}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/users/${v.customer_id}`} className="text-brand-600">
                      {v.customer_email || v.customer_id}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/orders/${v.order_id}`} className="text-brand-600">
                      #{v.order_id}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{v.status}</td>
                  <td className="py-3 pr-4 max-w-[120px] truncate" title={v.comment}>
                    {v.comment || "—"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs max-w-[140px] truncate" title={v.public_key}>
                    {v.public_key ? `${v.public_key.slice(0, 12)}…` : "—"}
                  </td>
                  <td className="py-3 pr-4">{v.expires_at || "—"}</td>
                  <td className="py-3">
                    {canReprovision &&
                      (v.status === "failed" || v.status === "provisioning") && (
                        <button
                          onClick={() => reprovision(v.id)}
                          className="text-sm text-brand-600"
                        >
                          {t("reprovision")}
                        </button>
                      )}
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
