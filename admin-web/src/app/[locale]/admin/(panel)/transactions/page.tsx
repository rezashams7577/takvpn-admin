"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
import { AdminListShell } from "@/components/admin/AdminListShell";
import {
  adminListWalletTxns,
  adminListPayments,
  type WalletTransaction,
  type PaymentItem,
} from "@/lib/admin-api";

export default function AdminTransactionsPage() {
  const locale = useLocale();
  const t = useTranslations("adminPanel");
  const [tab, setTab] = useState<"wallet" | "payments">("wallet");
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    setErr("");
    if (tab === "wallet") {
      adminListWalletTxns()
        .then(setTxns)
        .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
        .finally(() => setLoading(false));
    } else {
      adminListPayments()
        .then(setPayments)
        .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const items = tab === "wallet" ? txns : payments;

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("transactions")}</h1>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("wallet")}
          className={`px-4 py-2 rounded-lg text-sm ${tab === "wallet" ? "bg-brand-600 text-white" : "border"}`}
        >
          Wallet ledger
        </button>
        <button
          onClick={() => setTab("payments")}
          className={`px-4 py-2 rounded-lg text-sm ${tab === "payments" ? "bg-brand-600 text-white" : "border"}`}
        >
          Payments
        </button>
      </div>
      <AdminListShell loading={loading} error={err} empty={!loading && !err && items.length === 0}>
        {tab === "wallet" ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b text-left text-[var(--muted)]">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((txn) => (
                  <tr key={txn.id} className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4">{txn.id}</td>
                    <td className="py-3 pr-4">{txn.customer_email || txn.customer_id}</td>
                    <td className="py-3 pr-4">{txn.type}</td>
                    <td className="py-3 pr-4">
                      {formatWalletBalance(txn.amount, txn.currency, locale)}{" "}
                      {txn.currency}
                    </td>
                    <td className="py-3">{new Date(txn.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b text-left text-[var(--muted)]">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)]">
                    <td className="py-3 pr-4">{p.id}</td>
                    <td className="py-3 pr-4">{p.customer_email || p.customer_id}</td>
                    <td className="py-3 pr-4">{p.provider}</td>
                    <td className="py-3 pr-4">{p.status}</td>
                    <td className="py-3 pr-4">
                      {formatWalletBalance(p.amount, p.currency, locale)} {p.currency}
                    </td>
                    <td className="py-3">{new Date(p.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminListShell>
    </div>
  );
}
