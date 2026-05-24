import { headers } from "next/headers";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { pathnameFromHeaders } from "@/lib/pathname";
import { Link } from "@/i18n/navigation";
import { fetchMe } from "@/lib/api";
import { AdminRoleProvider } from "@/components/admin/AdminRoleContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PanelShell } from "@/components/layout/PanelShell";
import { isStaffRole, type StaffRole } from "@/lib/admin-api";
import { userAppUrl } from "@/lib/app-urls";

type Props = {
  children: React.ReactNode;
};

export default async function AdminPanelLayout({ children }: Props) {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("adminPanel");

  let me;
  try {
    me = await fetchMe();
  } catch {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-[var(--muted)]">{t("sessionExpired")}</p>
        <Link href={`/admin/login?next=/admin`} className="text-brand-600 mt-2 inline-block">
          {t("signIn")}
        </Link>
      </div>
    );
  }

  if (!isStaffRole(me.role)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold">{t("accessDenied")}</h1>
        <p className="text-[var(--muted)] mt-2">{t("accessDeniedHint")}</p>
        <a href={userAppUrl("/dashboard", locale)} className="text-brand-600 mt-4 inline-block">
          {t("goToDashboard")}
        </a>
      </div>
    );
  }

  const userLocale = me.locale || locale;
  const h = await headers();
  const pathname = pathnameFromHeaders((name) => h.get(name));

  return (
    <PanelShell
      menuOpenLabel={t("menuOpen")}
      menuCloseLabel={t("menuClose")}
      sidebar={
        <AdminSidebar
          role={me.role as StaffRole}
          email={me.email}
          locale={userLocale}
          pathname={pathname}
        />
      }
    >
      <AdminRoleProvider role={me.role as StaffRole}>{children}</AdminRoleProvider>
    </PanelShell>
  );
}
