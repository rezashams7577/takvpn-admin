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
import { adminListPlans, type AdminPlan } from "@/lib/admin-api";
import { formatIrr, formatUsdt } from "@/lib/format";

export default function AdminPlansPage() {
  const t = useTranslations("adminPanel");
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
                    <Link href={`/admin/plans/${p.id}/edit`} className="text-brand-600 hover:underline">
                      Edit
                    </Link>
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
