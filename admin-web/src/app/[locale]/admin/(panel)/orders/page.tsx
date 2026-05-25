"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import {
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
import { adminListOrders, type AdminOrder } from "@/lib/admin-api";

export default function AdminOrdersPage() {
  const locale = useLocale();
  const t = useTranslations("adminPanel");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    adminListOrders()
      .then(setOrders)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage className="max-w-5xl">
      <PanelPageHeader title={t("orders")} />
      <PanelSection title={t("orders")}>
        <AdminListShell loading={loading} error={err} empty={!loading && !err && orders.length === 0}>
          <AdminDataTable minWidth="800px">
            <AdminTableHead>
              <AdminTableTh>ID</AdminTableTh>
              <AdminTableTh>Customer</AdminTableTh>
              <AdminTableTh>Plan</AdminTableTh>
              <AdminTableTh>Amount</AdminTableTh>
              <AdminTableTh>Status</AdminTableTh>
              <AdminTableTh>Date</AdminTableTh>
              <AdminTableTh>{t("view")}</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {orders.map((o) => (
                <AdminTableRow key={o.id}>
                  <AdminTableTd>#{o.id}</AdminTableTd>
                  <AdminTableTd>
                    <Link href={`/admin/users/${o.customer_id}`} className="text-brand-600">
                      {o.customer_email}
                    </Link>
                  </AdminTableTd>
                  <AdminTableTd>{o.plan_name}</AdminTableTd>
                  <AdminTableTd>
                    <span dir="ltr" className="inline-block tabular-nums">
                      {formatWalletBalance(o.amount, o.currency, locale)} {o.currency}
                    </span>
                  </AdminTableTd>
                  <AdminTableTd>{o.status}</AdminTableTd>
                  <AdminTableTd>
                    <span dir="ltr" className="inline-block whitespace-nowrap">
                      {new Date(o.created_at).toLocaleString()}
                    </span>
                  </AdminTableTd>
                  <AdminTableTd>
                    <Link href={`/admin/orders/${o.id}`} className="text-brand-600">
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
