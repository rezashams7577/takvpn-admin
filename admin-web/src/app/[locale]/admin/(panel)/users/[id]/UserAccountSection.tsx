"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
      <div className="-mt-4">
        <PanelActionRow
          variant="danger"
          title={isActive ? t("userSuspendTitle") : t("userActivateTitle")}
          description={isActive ? t("userSuspendDesc") : t("userActivateDesc")}
          action={
            <button
              type="button"
              onClick={toggleStatus}
              disabled={loading}
              className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                isActive
                  ? "border border-red-300 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "border border-[var(--border)] hover:bg-brand-50 dark:hover:bg-brand-900/30"
              }`}
            >
              {isActive ? t("userSuspendButton") : t("userActivateButton")}
            </button>
          }
        />
        {canViewAudit && (
          <PanelActionRow
            title={t("userAuditWalletTitle")}
            description={t("userAuditWalletDesc")}
            action={
              <Link
                href={`/admin/audit?action=wallet.adjustment&entity_id=${customerId}&entity_type=customer`}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30"
              >
                {t("auditFilterWallet")}
              </Link>
            }
          />
        )}
      </div>
      {msg && <FormMessage variant="success" className="mt-3">{msg}</FormMessage>}
      {err && <FormMessage variant="error" className="mt-2">{err}</FormMessage>}
    </PanelSection>
  );
}
