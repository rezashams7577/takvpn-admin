"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PanelSection } from "@/components/layout";
import { FormField, FormMessage, FormSubmit } from "@/components/forms";
import { adminResetPassword } from "@/lib/admin-api";

type Props = {
  customerId: number;
};

export function UserSecuritySection({ customerId }: Props) {
  const t = useTranslations("adminPanel");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setErr("");
    setMsg("");
    const fd = new FormData(form);
    const pass = String(fd.get("new_password"));
    if (pass.length < 12) {
      setErr(t("userPasswordMinLength"));
      return;
    }
    try {
      await adminResetPassword(customerId, pass);
      setMsg(t("userPasswordReset"));
      form.reset();
      setNewPass("");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    }
  }

  return (
    <PanelSection
      title={t("userSecuritySection")}
      description={t("userSecuritySectionDesc")}
    >
      <form onSubmit={onResetPassword} className="admin-form max-w-md space-y-3" dir="ltr">
        <FormField
          label={t("resetPasswordPlaceholder")}
          name="new_password"
          type="password"
          required
          minLength={12}
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        {msg && <FormMessage variant="success">{msg}</FormMessage>}
        {err && <FormMessage variant="error">{err}</FormMessage>}
        <FormSubmit>{t("resetPasswordButton")}</FormSubmit>
      </form>
    </PanelSection>
  );
}
