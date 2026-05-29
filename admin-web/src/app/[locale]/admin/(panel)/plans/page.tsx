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
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { adminDeletePlan, adminListPlans, type AdminPlan } from "@/lib/admin-api";
import { formatIrr, formatUsdt } from "@/lib/format";

export default function AdminPlansPage() {
  const t = useTranslations("adminPanel");
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(p: AdminPlan) {
    if (!window.confirm(t("planDeleteConfirm", { name: p.name }))) return;
    setDeletingId(p.id);
    setErr("");
    try {
      await adminDeletePlan(p.id);
      setPlans((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("failed");
      setErr(msg === "plan has orders" ? t("planDeleteInUse") : msg);
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    adminListPlans()
      .then(setPlans)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage className="max-w-5xl">
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
              <AdminTableTh className="tabular-nums">USDT</AdminTableTh>
              <AdminTableTh className="tabular-nums">IRR</AdminTableTh>
              <AdminTableTh className="tabular-nums">Days</AdminTableTh>
              <AdminTableTh>Active</AdminTableTh>
              <AdminTableTh>Actions</AdminTableTh>
            </AdminTableHead>
            <AdminTableBody>
              {plans.map((p) => (
                <AdminTableRow key={p.id}>
                  <AdminTableTd>{p.name}</AdminTableTd>
                  <AdminTableTd className="font-mono text-xs text-[var(--muted)]">{p.slug}</AdminTableTd>
                  <AdminTableTd className="tabular-nums">{formatUsdt(p.price_usdt)}</AdminTableTd>
                  <AdminTableTd className="tabular-nums">{formatIrr(p.price_irr, "en")}</AdminTableTd>
                  <AdminTableTd className="tabular-nums">{p.duration_days}</AdminTableTd>
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
                        onClick={() => handleDelete(p)}
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
