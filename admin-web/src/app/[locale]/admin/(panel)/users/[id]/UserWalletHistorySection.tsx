"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
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
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b text-left text-[var(--muted)]">
                <th className="py-2 pr-4">{t("labelDate")}</th>
                <th className="py-2 pr-4">{t("labelType")}</th>
                <th className="py-2 pr-4">{t("labelAmount")}</th>
                <th className="py-2">{t("labelNote")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className={`border-b border-[var(--border)] ${
                    txn.type === "adjustment" ? "bg-brand-600/5" : ""
                  }`}
                >
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {new Date(txn.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{txn.type}</td>
                  <td className="py-2 pr-4 tabular-nums">
                    {formatWalletBalance(txn.amount, txn.currency, locale)}{" "}
                    {txn.currency}
                  </td>
                  <td className="py-2 text-[var(--muted)]">{txn.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelSection>
  );
}
