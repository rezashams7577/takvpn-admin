"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { AdminListShell } from "@/components/admin/AdminListShell";
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
    <div>
      <h1 className="text-2xl font-bold">{t("orders")}</h1>
      <AdminListShell loading={loading} error={err} empty={!loading && !err && orders.length === 0}>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[var(--muted)]">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4">#{o.id}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/admin/users/${o.customer_id}`} className="text-brand-600">
                      {o.customer_email}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{o.plan_name}</td>
                  <td className="py-3 pr-4">
                    {formatWalletBalance(o.amount, o.currency, locale)} {o.currency}
                  </td>
                  <td className="py-3 pr-4">{o.status}</td>
                  <td className="py-3 pr-4">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="py-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-brand-600">
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
