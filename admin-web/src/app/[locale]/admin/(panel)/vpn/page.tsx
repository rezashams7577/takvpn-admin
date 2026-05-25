"use client";

import { useEffect, useState } from "react";
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
import { FormMessage } from "@/components/forms";
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
    <AdminPage className="max-w-6xl">
      <PanelPageHeader title={t("vpn")} />
      <PanelSection title={t("vpn")}>
        <div className="admin-form max-w-xs mb-4" dir="ltr">
          <label className="admin-field-label">Status filter</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="admin-select w-full"
          >
            <option value="">All statuses</option>
            <option value="provisioning">Provisioning</option>
            <option value="active">Active</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        {msg && <FormMessage variant="success" className="mb-2">{msg}</FormMessage>}
        {actionErr && <FormMessage variant="error" className="mb-2">{actionErr}</FormMessage>}
        <AdminListShell
          loading={loading}
          error={loadErr}
          empty={!loading && !loadErr && list.length === 0}
        >
          <AdminDataTable minWidth="800px">
            <AdminTableHead>
              <AdminTableTh>ID</AdminTableTh>
              <AdminTableTh>Customer</AdminTableTh>
              <AdminTableTh>Order</AdminTableTh>
              <AdminTableTh>Status</AdminTableTh>
              <AdminTableTh>{t("comment")}</AdminTableTh>
              <AdminTableTh>{t("publicKey")}</AdminTableTh>
              <AdminTableTh>Expires</AdminTableTh>
              <AdminTableTh>Actions</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {list.map((v) => (
                <AdminTableRow key={v.id}>
                  <AdminTableTd>{v.id}</AdminTableTd>
                  <AdminTableTd>
                    <Link href={`/admin/users/${v.customer_id}`} className="text-brand-600">
                      {v.customer_email || v.customer_id}
                    </Link>
                  </AdminTableTd>
                  <AdminTableTd>
                    <Link href={`/admin/orders/${v.order_id}`} className="text-brand-600">
                      #{v.order_id}
                    </Link>
                  </AdminTableTd>
                  <AdminTableTd>{v.status}</AdminTableTd>
                  <AdminTableTd className="max-w-[120px] truncate" title={v.comment}>
                    {v.comment || "—"}
                  </AdminTableTd>
                  <AdminTableTd className="max-w-[140px] truncate" title={v.public_key}>
                    <span dir="ltr" className="font-mono text-xs inline-block">
                      {v.public_key ? `${v.public_key.slice(0, 12)}…` : "—"}
                    </span>
                  </AdminTableTd>
                  <AdminTableTd>
                    <span dir="ltr" className="inline-block whitespace-nowrap">
                      {v.expires_at || "—"}
                    </span>
                  </AdminTableTd>
                  <AdminTableTd>
                    {canReprovision &&
                      (v.status === "failed" || v.status === "provisioning") && (
                        <AdminButton variant="ghost" onClick={() => reprovision(v.id)}>
                          {t("reprovision")}
                        </AdminButton>
                      )}
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
