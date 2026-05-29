"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPage } from "@/components/admin/AdminPage";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import {
  adminGetPaymentSettings,
  adminUpdatePaymentSettings,
  type PaymentSettings,
} from "@/lib/admin-api";

export default function AdminPaymentSettingsPage() {
  const t = useTranslations("adminPanel");
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [trc20, setTrc20] = useState("");
  const [erc20, setErc20] = useState("");
  const [usdtEnabled, setUsdtEnabled] = useState(true);
  const [tomanEnabled, setTomanEnabled] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoadErr("");
    try {
      const s = await adminGetPaymentSettings();
      setSettings(s);
      setTrc20(s.trc20_deposit_address);
      setErc20(s.erc20_deposit_address);
      setUsdtEnabled(s.usdt_enabled);
      setTomanEnabled(s.toman_enabled);
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
      const s = await adminUpdatePaymentSettings({
        trc20_deposit_address: trc20.trim(),
        erc20_deposit_address: erc20.trim(),
        usdt_enabled: usdtEnabled,
        toman_enabled: tomanEnabled,
      });
      setSettings(s);
      setTrc20(s.trc20_deposit_address);
      setErc20(s.erc20_deposit_address);
      setUsdtEnabled(s.usdt_enabled);
      setTomanEnabled(s.toman_enabled);
      setMsg(t("paymentSettingsSaved"));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  const showEnvFallback =
    settings &&
    ((settings.trc20_deposit_address === "" && settings.env_fallback.trc20 !== "") ||
      (settings.erc20_deposit_address === "" && settings.env_fallback.erc20 !== ""));

  return (
    <AdminPage>
      <PanelPageHeader
        title={t("paymentSettings")}
        description={t("paymentSettingsHint")}
      />

      {loadErr && <p className="text-sm text-[var(--danger)]">{loadErr}</p>}

      {settings && (
        <PanelSection
          title={t("paymentEffectiveSection")}
          description={t("paymentEffectiveSectionDesc")}
        >
          <div className="text-xs text-[var(--muted)] space-y-1" dir="ltr">
            <p>
              {t("effectiveTrc20")}: <code>{settings.effective.trc20 || "—"}</code>
            </p>
            <p>
              {t("effectiveErc20")}: <code>{settings.effective.erc20 || "—"}</code>
            </p>
            {showEnvFallback && (
              <p className="text-brand-600 mt-2">{t("envFallbackHint")}</p>
            )}
          </div>
        </PanelSection>
      )}

      <PanelSection
        title={t("paymentMethodsSection")}
        description={t("paymentMethodsSectionDesc")}
      >
        <form onSubmit={onSubmit} className="admin-form max-w-md space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={usdtEnabled}
                onChange={(e) => setUsdtEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--input-border)]"
              />
              {t("paymentUsdtEnabled")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={tomanEnabled}
                onChange={(e) => setTomanEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--input-border)]"
              />
              {t("paymentTomanEnabled")}
            </label>
            {!usdtEnabled && !tomanEnabled && (
              <p className="text-sm text-amber-700 dark:text-amber-300" role="alert">
                {t("paymentBothDisabledWarning")}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--border)] pt-4 space-y-3" dir="ltr">
            <p className="text-sm font-medium">{t("paymentAddressesSection")}</p>
            <FormField
              label={t("trc20DepositAddress")}
              name="trc20_deposit_address"
              value={trc20}
              onChange={(e) => setTrc20(e.target.value)}
              placeholder="T..."
            />
            <FormField
              label={t("erc20DepositAddress")}
              name="erc20_deposit_address"
              value={erc20}
              onChange={(e) => setErc20(e.target.value)}
              placeholder="0x..."
            />
          </div>

          {msg && <FormMessage variant="success">{msg}</FormMessage>}
          {err && <FormMessage variant="error">{err}</FormMessage>}
          <FormSubmit loading={loading}>{t("paymentSettingsSave")}</FormSubmit>
        </form>
      </PanelSection>
    </AdminPage>
  );
}
