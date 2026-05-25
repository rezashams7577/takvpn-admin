"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminButton } from "@/components/admin";
import { PanelActionRow, PanelSection } from "@/components/layout";
import { FormMessage } from "@/components/forms";
import { adminPatchCustomer } from "@/lib/admin-api";
import type { StaffRole } from "@/lib/admin-api";

type Props = {
  customerId: number;
  status: string;
  staffRole: StaffRole;
  onUpdated: () => void;
};

export function UserAccountSection({
  customerId,
  status,
  staffRole,
  onUpdated,
}: Props) {
  const t = useTranslations("adminPanel");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const isActive = status === "active";
  const canViewAudit = staffRole === "admin" || staffRole === "super_admin";

  async function toggleStatus() {
    setLoading(true);
    setErr("");
    setMsg("");
    const next = isActive ? "suspended" : "active";
    try {
      await adminPatchCustomer(customerId, { status: next });
      setMsg(t("userStatusUpdated", { status: next }));
      onUpdated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PanelSection
      title={t("userAccountSection")}
      description={t("userAccountSectionDesc")}
      variant="danger"
    >
      <PanelActionRow
        variant="danger"
        title={isActive ? t("userSuspendTitle") : t("userActivateTitle")}
        description={isActive ? t("userSuspendDesc") : t("userActivateDesc")}
        action={
          <AdminButton
            variant={isActive ? "danger" : "secondary"}
            onClick={toggleStatus}
            disabled={loading}
          >
            {isActive ? t("userSuspendButton") : t("userActivateButton")}
          </AdminButton>
        }
      />
      {canViewAudit && (
        <PanelActionRow
          title={t("userAuditWalletTitle")}
          description={t("userAuditWalletDesc")}
          action={
            <AdminButton
              variant="secondary"
              href={`/admin/audit?action=wallet.adjustment&entity_id=${customerId}&entity_type=customer`}
            >
              {t("auditFilterWallet")}
            </AdminButton>
          }
        />
      )}
      {msg && <FormMessage variant="success" className="mt-3">{msg}</FormMessage>}
      {err && <FormMessage variant="error" className="mt-2">{err}</FormMessage>}
    </PanelSection>
  );
}
