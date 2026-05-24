"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { tryRefreshSession } from "@takvpn/shared/lib/auth-session";
import { login } from "@/lib/api";
import { isStaffRole } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const t = useTranslations("adminPanel");
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16">{t("signIn")}…</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const search = useSearchParams();
  const tAuth = useTranslations("auth");
  const t = useTranslations("adminPanel");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tryRefreshSession().then((ok) => {
      if (!ok) return;
      const next = search.get("next");
      const dest = (next as "/admin") || "/admin";
      router.replace(dest);
      router.refresh();
    });
  }, [router, search]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await login({
        email: fd.get("email") as string,
        password: fd.get("password") as string,
      });
      if (!isStaffRole(res.role)) {
        setError(t("accessDeniedHint"));
        return;
      }
      const next = search.get("next");
      let dest = "/admin";
      if (next) {
        if (next.startsWith("http")) {
          try {
            dest = new URL(next).pathname;
          } catch {
            dest = "/admin";
          }
        } else {
          dest = next;
        }
      }
      router.push(dest as "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : tAuth("loginFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold">{t("adminLoginTitle")}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{t("adminLoginHint")}</p>
      <form onSubmit={onSubmit} className="admin-form mt-8 max-w-md space-y-3" dir="ltr">
        <FormField label={tAuth("email")} name="email" type="email" required />
        <FormField label={tAuth("password")} name="password" type="password" required />
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <FormSubmit loading={loading} className="w-full">
          {loading ? tAuth("signInLoading") : t("signIn")}
        </FormSubmit>
      </form>
      <p className="mt-4 text-sm text-center text-[var(--muted)]">
        <Link href="/admin" locale={locale} className="text-brand-600">
          ← {t("dashboard")}
        </Link>
      </p>
    </div>
  );
}
