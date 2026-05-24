"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPage } from "@/components/admin/AdminPage";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { changePassword } from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const t = useTranslations("adminPanel");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      await changePassword(currentPassword, newPassword);
      setMsg(t("passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPage>
      <PanelPageHeader title={t("settingsTitle")} description={t("settingsPageDesc")} />
      <PanelSection
        title={t("settingsSecuritySection")}
        description={t("settingsSecuritySectionDesc")}
      >
        <h3 className="font-medium text-sm mb-3">{t("changePasswordTitle")}</h3>
        <form onSubmit={onSubmit} className="admin-form max-w-md space-y-3" dir="ltr">
          <FormField
            label={t("currentPassword")}
            name="current"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <FormField
            label={t("newPassword")}
            name="new"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {msg && <FormMessage variant="success">{msg}</FormMessage>}
          {err && <FormMessage variant="error">{err}</FormMessage>}
          <FormSubmit loading={loading}>{t("updatePassword")}</FormSubmit>
        </form>
      </PanelSection>
    </AdminPage>
  );
}
