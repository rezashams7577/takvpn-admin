"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatWalletBalance } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { PanelSection } from "@/components/layout";

type Order = {
  id: number;
  status: string;
  amount: string;
  currency?: string;
};

type Props = {
  orders: Order[];
};

export function UserOrdersSection({ orders }: Props) {
  const t = useTranslations("adminPanel");
  const locale = useLocale();

  return (
    <PanelSection
      title={t("userOrdersSection")}
      description={t("userOrdersSectionDesc")}
    >
      <ul className="space-y-1 text-sm">
        {orders.length === 0 ? (
          <li className="text-[var(--muted)]">{t("noRecords")}</li>
        ) : (
          orders.slice(0, 10).map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="text-brand-600">
                #{o.id}
              </Link>{" "}
              — {o.status} —{" "}
              {o.currency
                ? `${formatWalletBalance(o.amount, o.currency, locale)} ${o.currency}`
                : o.amount}
            </li>
          ))
        )}
      </ul>
    </PanelSection>
  );
}
