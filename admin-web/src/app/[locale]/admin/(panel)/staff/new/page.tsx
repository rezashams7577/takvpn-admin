"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminField, AdminPage } from "@/components/admin";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { FormMessage, FormSelect, FormSubmit } from "@/components/forms";
import { adminCreateStaff } from "@/lib/admin-api";

export default function CreateStaffPage() {
  const t = useTranslations("adminPanel");
  const router = useRouter();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    try {
      await adminCreateStaff({
        email: fd.get("email"),
        password: fd.get("password"),
        name: fd.get("name"),
        locale: fd.get("locale"),
        role: fd.get("role"),
      });
      router.push("/admin/users");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPage>
      <PanelPageHeader title={t("createStaffTitle")} />
      <PanelSection title={t("createStaffTitle")}>
      <form onSubmit={onSubmit} className="admin-form max-w-md space-y-3" dir="ltr">
        <AdminField label={t("staffEmail")} name="email" type="email" required />
        <AdminField
          label={t("staffPassword")}
          name="password"
          type="password"
          required
          minLength={12}
        />
        <AdminField label={t("staffName")} name="name" />
        <FormSelect
          label={t("staffLocale")}
          name="locale"
          defaultValue="en"
          options={[
            { value: "en", label: "en" },
            { value: "fa", label: "fa" },
          ]}
        />
        <FormSelect
          label={t("staffRole")}
          name="role"
          defaultValue="support"
          required
          options={[
            { value: "support", label: "support" },
            { value: "admin", label: "admin" },
            { value: "super_admin", label: "super_admin" },
          ]}
        />
        {err && <FormMessage variant="error">{err}</FormMessage>}
        <FormSubmit loading={loading}>
          {loading ? t("loading") : t("createStaff")}
        </FormSubmit>
      </form>
      </PanelSection>
    </AdminPage>
  );
}
