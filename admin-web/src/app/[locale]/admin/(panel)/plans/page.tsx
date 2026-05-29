"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  AdminButton,
  AdminDataTable,
  AdminListShell,
  AdminPage,
  AdminTableBody,
  AdminTableHead,
  AdminTableRow,
  AdminTableTd,
  AdminTableTh,
} from "@/components/admin";
import { useConfirmDialog } from "@/components/useConfirmDialog";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import {
  adminGetPaymentSettings,
  adminListPlans,
  type AdminPlan,
  type PaymentSettings,
} from "@/lib/admin-api";
import { deletePlanWithConfirm } from "@/lib/delete-plan-with-confirm";
import { formatIrr, formatUsdt } from "@/lib/format";

export default function AdminPlansPage() {
  const t = useTranslations("adminPanel");
  const { ask, ConfirmDialog } = useConfirmDialog();
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(p: AdminPlan) {
    setDeletingId(p.id);
    setErr("");
    await deletePlanWithConfirm(p, ask, t, {
      onDeleted: () => setPlans((prev) => prev.filter((x) => x.id !== p.id)),
      onError: setErr,
    });
    setDeletingId(null);
  }

  useEffect(() => {
    Promise.all([adminListPlans(), adminGetPaymentSettings()])
      .then(([p, ps]) => {
        setPlans(p);
        setPayment(ps);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const showUsdt = payment?.usdt_enabled !== false;
  const showToman = payment?.toman_enabled !== false;

  return (
    <AdminPage className="max-w-5xl">
      <ConfirmDialog />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PanelPageHeader title={t("plans")} />
        <AdminButton href="/admin/plans/new">New plan</AdminButton>
      </div>
      <PanelSection title={t("plans")}>
        <AdminListShell loading={loading} error={err} empty={!loading && !err && plans.length === 0}>
          <AdminDataTable minWidth="720px">
            <AdminTableHead>
              <AdminTableTh>Name</AdminTableTh>
              <AdminTableTh>Slug</AdminTableTh>
              {showUsdt && <AdminTableTh className="tabular-nums">USDT</AdminTableTh>}
              {showToman && <AdminTableTh className="tabular-nums">IRR</AdminTableTh>}
              <AdminTableTh className="tabular-nums">Days</AdminTableTh>
              <AdminTableTh className="tabular-nums">{t("planMaxDevices")}</AdminTableTh>
              <AdminTableTh>Active</AdminTableTh>
              <AdminTableTh>Actions</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {plans.map((p) => (
                <AdminTableRow key={p.id}>
                  <AdminTableTd>{p.name}</AdminTableTd>
                  <AdminTableTd className="font-mono text-xs text-[var(--muted)]">{p.slug}</AdminTableTd>
                  {showUsdt && (
                    <AdminTableTd className="tabular-nums">{formatUsdt(p.price_usdt ?? "0")}</AdminTableTd>
                  )}
                  {showToman && (
                    <AdminTableTd className="tabular-nums">{formatIrr(p.price_irr ?? "0", "en")}</AdminTableTd>
                  )}
                  <AdminTableTd className="tabular-nums">
                    {p.duration_days != null ? p.duration_days : t("planDurationUnlimited")}
                  </AdminTableTd>
                  <AdminTableTd className="tabular-nums">{p.max_devices ?? 1}</AdminTableTd>
                  <AdminTableTd>{p.is_active ? "Yes" : "No"}</AdminTableTd>
                  <AdminTableTd>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/admin/plans/${p.id}/edit`} className="text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <AdminButton
                        type="button"
                        variant="danger"
                        className="px-2 py-1 text-xs"
                        disabled={deletingId === p.id}
                        onClick={() => void handleDelete(p)}
                      >
                        {deletingId === p.id ? t("planDeleting") : t("planDelete")}
                      </AdminButton>
                    </div>
                  </AdminTableTd>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminDataTable>
        </AdminListShell>
      </PanelSection>
    </AdminPage>
  );
}
