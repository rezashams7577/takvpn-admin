"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableHead,
  AdminTableRow,
  AdminTableTd,
  AdminTableTh,
} from "@/components/admin";
import { PanelSection } from "@/components/layout";
import type { WalletTransaction } from "@/lib/admin-api";

type Props = {
  transactions: WalletTransaction[];
};

export function UserWalletHistorySection({ transactions }: Props) {
  const t = useTranslations("adminPanel");
  const locale = useLocale();

  return (
    <PanelSection title={t("walletHistory")}>
      {transactions.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t("noRecords")}</p>
      ) : (
        <AdminDataTable minWidth="480px">
          <AdminTableHead>
            <AdminTableTh>{t("labelDate")}</AdminTableTh>
            <AdminTableTh>{t("labelType")}</AdminTableTh>
            <AdminTableTh>{t("labelAmount")}</AdminTableTh>
            <AdminTableTh>{t("labelNote")}</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {transactions.map((txn) => (
              <AdminTableRow
                key={txn.id}
                className={txn.type === "adjustment" ? "bg-brand-600/5" : ""}
              >
                <AdminTableTd>
                  <span dir="ltr" className="inline-block whitespace-nowrap">
                    {new Date(txn.created_at).toLocaleString()}
                  </span>
                </AdminTableTd>
                <AdminTableTd>{txn.type}</AdminTableTd>
                <AdminTableTd>
                  <span dir="ltr" className="inline-block tabular-nums">
                    {formatWalletBalance(txn.amount, txn.currency, locale)} {txn.currency}
                  </span>
                </AdminTableTd>
                <AdminTableTd className="text-[var(--muted)]">{txn.note || "—"}</AdminTableTd>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminDataTable>
      )}
    </PanelSection>
  );
}
