"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StaffRole } from "@/lib/admin-api";
import { userAppUrl } from "@/lib/app-urls";

const allNav = [
  { href: "/admin" as const, key: "dashboard", roles: ["support", "admin", "super_admin"] },
  { href: "/admin/users" as const, key: "users", roles: ["support", "admin", "super_admin"] },
  { href: "/admin/staff/new" as const, key: "createStaff", roles: ["super_admin"] },
  { href: "/admin/payment-settings" as const, key: "paymentSettings", roles: ["super_admin"] },
  { href: "/admin/plans" as const, key: "plans", roles: ["admin", "super_admin"] },
  { href: "/admin/orders" as const, key: "orders", roles: ["support", "admin", "super_admin"] },
  { href: "/admin/transactions" as const, key: "transactions", roles: ["support", "admin", "super_admin"] },
  { href: "/admin/deposits" as const, key: "deposits", roles: ["support", "admin", "super_admin"] },
  { href: "/admin/tickets" as const, key: "tickets", roles: ["support", "admin", "super_admin"] },
  { href: "/admin/exchange-rate" as const, key: "exchangeRate", roles: ["admin", "super_admin"] },
  { href: "/admin/vpn" as const, key: "vpn", roles: ["support", "admin", "super_admin"] },
  { href: "/admin/audit" as const, key: "audit", roles: ["admin", "super_admin"] },
  { href: "/admin/settings" as const, key: "settings", roles: ["support", "admin", "super_admin"] },
] as const;

type Props = {
  role: StaffRole;
  email: string;
  locale: string;
  pathname: string;
};

export function AdminSidebar({ role, email, locale, pathname }: Props) {
  const t = useTranslations("adminPanel");
  const nav = allNav.filter((n) => (n.roles as readonly string[]).includes(role));

  return (
    <div>
      <p className="text-xs text-[var(--muted)] mb-2 px-3">{t("signedInAs")}</p>
      <p className="text-sm font-medium px-3 mb-4 truncate" title={email}>
        {email}
      </p>
      <p className="text-xs text-brand-600 px-3 mb-4 capitalize">{role.replace("_", " ")}</p>
      <nav className="flex flex-col gap-1 text-sm font-medium">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 ${
                active
                  ? "bg-brand-600 text-white"
                  : "hover:bg-brand-50 dark:hover:bg-brand-900/30"
              }`}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 px-3 space-y-2 border-t border-[var(--border)] pt-4">
        <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{t("customerAccount")}</p>
        <a
          href={userAppUrl("/dashboard", locale)}
          className="block text-sm hover:text-brand-600"
        >
          {t("myAccount")}
        </a>
        <a
          href={userAppUrl("/dashboard/wallet", locale)}
          className="block text-sm hover:text-brand-600"
        >
          {t("wallet")}
        </a>
        <a
          href={userAppUrl("/dashboard/plans", locale)}
          className="block text-sm hover:text-brand-600"
        >
          {t("buyPlan")}
        </a>
        <a href={userAppUrl("/", locale)} className="block text-xs text-[var(--muted)] hover:text-brand-600 mt-2">
          {t("backToSite")}
        </a>
      </div>
    </div>
  );
}
