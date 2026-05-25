"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
import { PanelSection } from "@/components/layout";
import { FormField, FormMessage, FormSelect, FormSubmit } from "@/components/forms";
import { adminWalletAdjust } from "@/lib/admin-api";

type Wallet = { currency: string; balance: string };

type Props = {
  customerId: number;
  wallets: Wallet[];
  canAdjust: boolean;
  onAdjusted: () => void;
};

export function UserWalletsSection({
  customerId,
  wallets,
  canAdjust,
  onAdjusted,
}: Props) {
  const t = useTranslations("adminPanel");
  const locale = useLocale();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submitWalletAdjust(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setErr("");
    setMsg("");
    const fd = new FormData(form);
    const direction = String(fd.get("direction")) as "credit" | "debit";
    const amountStr = String(fd.get("amount"));
    const amount = parseFloat(amountStr);
    if (Number.isNaN(amount) || amount <= 0) {
      setErr(t("failed"));
      return;
    }
    try {
      await adminWalletAdjust({
        customer_id: customerId,
        currency: String(fd.get("currency")),
        amount: amountStr,
        direction,
        note: String(fd.get("note")),
      });
      setMsg(t("adjustSuccess"));
      form.reset();
      onAdjusted();
    } catch (ex) {
      const message = ex instanceof Error ? ex.message : t("failed");
      if (message.toLowerCase().includes("insufficient")) {
        setErr(t("insufficientBalance"));
      } else {
        setErr(message);
      }
    }
  }

  return (
    <PanelSection
      title={t("userWalletsSection")}
      description={t("userWalletsSectionDesc")}
    >
      <ul className="space-y-2 text-sm">
        {wallets.length === 0 ? (
          <li className="text-[var(--muted)]">{t("noRecords")}</li>
        ) : (
          wallets.map((w, i) => (
            <li key={i} className="text-start">
              <span dir="ltr" className="inline-block font-medium tabular-nums">
                {w.currency}: {formatWalletBalance(w.balance, w.currency, locale)}
              </span>
            </li>
          ))
        )}
      </ul>

      {canAdjust && (
        <form
          onSubmit={submitWalletAdjust}
          className="admin-form mt-6 max-w-md space-y-3 border-t border-[var(--border)] pt-6"
          dir="ltr"
        >
          <h3 className="font-medium text-sm">{t("walletAdjust")}</h3>
          <FormSelect
            label={t("adjustDirection")}
            name="direction"
            defaultValue="credit"
            options={[
              { value: "credit", label: t("adjustAdd") },
              { value: "debit", label: t("adjustRemove") },
            ]}
          />
          <FormSelect
            label={t("adjustCurrency")}
            name="currency"
            defaultValue="USDT"
            options={[
              { value: "USDT", label: "USDT" },
              { value: "IRR", label: "IRR" },
            ]}
          />
          <FormField
            label={t("adjustAmount")}
            name="amount"
            type="number"
            step="any"
            min="0.00000001"
            required
          />
          <FormField label={t("adjustNote")} name="note" required />
          {msg && <FormMessage variant="success">{msg}</FormMessage>}
          {err && <FormMessage variant="error">{err}</FormMessage>}
          <FormSubmit>{t("adjustSubmit")}</FormSubmit>
        </form>
      )}
    </PanelSection>
  );
}
