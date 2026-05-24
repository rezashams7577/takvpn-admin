"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PanelSection } from "@/components/layout";
import { FormMessage, FormSelect, FormSubmit } from "@/components/forms";
import { adminSetRole } from "@/lib/admin-api";

type Props = {
  customerId: number;
  currentRole: string;
  onUpdated: () => void;
};

export function UserRoleSection({ customerId, currentRole, onUpdated }: Props) {
  const t = useTranslations("adminPanel");
  const [newRole, setNewRole] = useState(currentRole);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setNewRole(currentRole);
  }, [currentRole]);

  async function onChangeRole(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const r = String(fd.get("role"));
    if (!r) return;
    try {
      await adminSetRole(customerId, r);
      setMsg(t("userRoleUpdated"));
      onUpdated();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    }
  }

  return (
    <PanelSection
      title={t("userRoleSection")}
      description={t("userRoleSectionDesc")}
    >
      <form onSubmit={onChangeRole} className="admin-form max-w-md space-y-3" dir="ltr">
        <FormSelect
          label={t("changeRolePlaceholder")}
          name="role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          options={[
            { value: "customer", label: t("roleCustomer") },
            { value: "support", label: t("roleSupport") },
            { value: "admin", label: t("roleAdmin") },
            { value: "super_admin", label: t("roleSuperAdmin") },
          ]}
        />
        {msg && <FormMessage variant="success">{msg}</FormMessage>}
        {err && <FormMessage variant="error">{err}</FormMessage>}
        <FormSubmit type="submit">{t("changeRoleButton")}</FormSubmit>
      </form>
    </PanelSection>
  );
}
