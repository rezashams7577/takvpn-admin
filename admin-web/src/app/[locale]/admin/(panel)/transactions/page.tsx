"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
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
    <AdminPage className="max-w-5xl">
      <PanelPageHeader title={t("transactions")} />
      <PanelSection title={t("transactions")}>
        <div className="flex flex-wrap gap-2 mb-4">
          <AdminButton
            variant={tab === "wallet" ? "primary" : "secondary"}
            onClick={() => setTab("wallet")}
          >
            Wallet ledger
          </AdminButton>
          <AdminButton
            variant={tab === "payments" ? "primary" : "secondary"}
            onClick={() => setTab("payments")}
          >
            Payments
          </AdminButton>
        </div>
        <AdminListShell loading={loading} error={err} empty={!loading && !err && items.length === 0}>
          {tab === "wallet" ? (
            <AdminDataTable minWidth="640px">
              <AdminTableHead>
                <AdminTableTh>ID</AdminTableTh>
                <AdminTableTh>Customer</AdminTableTh>
                <AdminTableTh>Type</AdminTableTh>
                <AdminTableTh>Amount</AdminTableTh>
                <AdminTableTh>Date</AdminTableTh>
              </AdminTableHead>
              <AdminTableBody>
                {txns.map((txn) => (
                  <AdminTableRow key={txn.id}>
                    <AdminTableTd>{txn.id}</AdminTableTd>
                    <AdminTableTd>{txn.customer_email || txn.customer_id}</AdminTableTd>
                    <AdminTableTd>{txn.type}</AdminTableTd>
                    <AdminTableTd>
                      <span dir="ltr" className="inline-block tabular-nums">
                        {formatWalletBalance(txn.amount, txn.currency, locale)} {txn.currency}
                      </span>
                    </AdminTableTd>
                    <AdminTableTd>
                      <span dir="ltr" className="inline-block whitespace-nowrap">
                        {new Date(txn.created_at).toLocaleString()}
                      </span>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminDataTable>
          ) : (
            <AdminDataTable minWidth="640px">
              <AdminTableHead>
                <AdminTableTh>ID</AdminTableTh>
                <AdminTableTh>Customer</AdminTableTh>
                <AdminTableTh>Provider</AdminTableTh>
                <AdminTableTh>Status</AdminTableTh>
                <AdminTableTh>Amount</AdminTableTh>
                <AdminTableTh>Date</AdminTableTh>
              </AdminTableHead>
              <AdminTableBody>
                {payments.map((p) => (
                  <AdminTableRow key={p.id}>
                    <AdminTableTd>{p.id}</AdminTableTd>
                    <AdminTableTd>{p.customer_email || p.customer_id}</AdminTableTd>
                    <AdminTableTd>{p.provider}</AdminTableTd>
                    <AdminTableTd>{p.status}</AdminTableTd>
                    <AdminTableTd>
                      <span dir="ltr" className="inline-block tabular-nums">
                        {formatWalletBalance(p.amount, p.currency, locale)} {p.currency}
                      </span>
                    </AdminTableTd>
                    <AdminTableTd>
                      <span dir="ltr" className="inline-block whitespace-nowrap">
                        {new Date(p.created_at).toLocaleString()}
                      </span>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminDataTable>
          )}
        </AdminListShell>
      </PanelSection>
    </AdminPage>
  );
}
