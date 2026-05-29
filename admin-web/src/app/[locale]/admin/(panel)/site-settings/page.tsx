"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPage } from "@/components/admin/AdminPage";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { FormMessage, FormSubmit } from "@/components/forms";
import {
  adminGetSiteSettings,
  adminUpdateSiteSettings,
  type SiteSettings,
} from "@/lib/admin-api";

export default function AdminSiteSettingsPage() {
  const t = useTranslations("adminPanel");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [plansSell, setPlansSell] = useState(false);
  const [ticketing, setTicketing] = useState(true);
  const [authLogin, setAuthLogin] = useState(true);
  const [authRegister, setAuthRegister] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoadErr("");
    try {
      const s = await adminGetSiteSettings();
      setSettings(s);
      setPlansSell(s.plans_sell_enabled);
      setTicketing(s.ticketing_enabled);
      setAuthLogin(s.auth_login_enabled);
      setAuthRegister(s.auth_register_enabled);
    } catch (ex) {
      setLoadErr(ex instanceof Error ? ex.message : t("failed"));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const s = await adminUpdateSiteSettings({
        plans_sell_enabled: plansSell,
        ticketing_enabled: ticketing,
        auth_login_enabled: authLogin,
        auth_register_enabled: authRegister,
      });
      setSettings(s);
      setPlansSell(s.plans_sell_enabled);
      setTicketing(s.ticketing_enabled);
      setAuthLogin(s.auth_login_enabled);
      setAuthRegister(s.auth_register_enabled);
      setMsg(t("siteSettingsSaved"));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPage>
      <PanelPageHeader
        title={t("siteSettings")}
        description={t("siteSettingsHint")}
      />

      {loadErr && <p className="text-sm text-[var(--danger)]">{loadErr}</p>}

      {settings && (
        <PanelSection
          title={t("siteSettingsSection")}
          description={t("siteSettingsSectionDesc")}
        >
          <form onSubmit={onSubmit} className="admin-form max-w-md space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={plansSell}
                onChange={(e) => setPlansSell(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--input-border)]"
              />
              {t("sitePlansSellEnabled")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ticketing}
                onChange={(e) => setTicketing(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--input-border)]"
              />
              {t("siteTicketingEnabled")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={authLogin}
                onChange={(e) => setAuthLogin(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--input-border)]"
              />
              {t("siteAuthLoginEnabled")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={authRegister}
                onChange={(e) => setAuthRegister(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--input-border)]"
              />
              {t("siteAuthRegisterEnabled")}
            </label>
            {!authLogin && !authRegister && (
              <p className="text-sm text-amber-700 dark:text-amber-300" role="alert">
                {t("siteAuthBothDisabledWarning")}
              </p>
            )}

            {msg && <FormMessage variant="success">{msg}</FormMessage>}
            {err && <FormMessage variant="error">{err}</FormMessage>}
            <FormSubmit loading={loading}>{t("siteSettingsSave")}</FormSubmit>
          </form>
        </PanelSection>
      )}
    </AdminPage>
  );
}
