"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminField } from "@/components/admin/AdminField";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { FormMessage, FormSubmit } from "@/components/forms";
import { adminDeletePlan, adminGetPlan, adminUpdatePlan, PlanHasOrdersError } from "@/lib/admin-api";
import { formatUsdt } from "@/lib/format";

export default function EditPlanPage() {
  const { id } = useParams();
  const t = useTranslations("adminPanel");
  const router = useRouter();
  const [err, setErr] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    adminGetPlan(Number(id))
      .then((p) => setPlan(p as unknown as Record<string, unknown>))
      .catch((e) => setLoadErr(e instanceof Error ? e.message : t("failed")));
  }, [id, t]);

  async function onDelete() {
    if (!plan || !window.confirm(t("planDeleteConfirm", { name: String(plan.name) }))) return;
    setDeleting(true);
    setErr("");
    const planName = String(plan.name);
    const planId = Number(id);
    try {
      await adminDeletePlan(planId);
      router.push("/admin/plans");
    } catch (ex) {
      if (ex instanceof PlanHasOrdersError) {
        if (!window.confirm(t("planDeleteCascadeConfirm", { name: planName, count: ex.orderCount }))) {
          return;
        }
        try {
          await adminDeletePlan(planId, true);
          router.push("/admin/plans");
        } catch (e2) {
          setErr(e2 instanceof Error ? e2.message : t("failed"));
        }
        return;
      }
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setDeleting(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    try {
      await adminUpdatePlan(Number(id), {
        slug: fd.get("slug"),
        name: fd.get("name"),
        description: fd.get("description"),
        duration_days: Number(fd.get("duration_days")),
        traffic_gb: fd.get("traffic_gb"),
        interface_id: Number(fd.get("interface_id")),
        price_usdt: fd.get("price_usdt"),
        price_irr: fd.get("price_irr"),
        is_active: fd.get("is_active") === "on",
        sort_order: Number(fd.get("sort_order")),
      });
      router.push("/admin/plans");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  if (!plan && !loadErr) return <p className="text-[var(--muted)]">{t("loading")}</p>;
  if (!plan) return <p className="text-sm text-[var(--danger)]">{loadErr}</p>;

  return (
    <AdminPage>
      <AdminBackLink href="/admin/plans" label={t("backToPlans")} />
      <PanelPageHeader title={t("planEditTitle")} />
      <PanelSection
        title={t("planFormSection")}
        description={t("planFormSectionDesc")}
      >
        <form onSubmit={onSubmit} className="admin-form max-w-md space-y-3" dir="ltr">
          <AdminField label={t("planSlug")} name="slug" defaultValue={String(plan.slug)} required />
          <AdminField label={t("planName")} name="name" defaultValue={String(plan.name)} required />
          <AdminField
            label={t("planDescription")}
            name="description"
            defaultValue={String(plan.description || "")}
            multiline
          />
          <AdminField
            label={t("planDurationDays")}
            name="duration_days"
            type="number"
            defaultValue={Number(plan.duration_days)}
            required
          />
          <AdminField
            label={t("planTrafficGb")}
            name="traffic_gb"
            defaultValue={
              plan.traffic_gb != null && plan.traffic_gb !== ""
                ? formatUsdt(String(plan.traffic_gb))
                : ""
            }
            step="0.01"
          />
          <AdminField
            label={t("planInterfaceId")}
            name="interface_id"
            type="number"
            defaultValue={Number(plan.interface_id)}
            required
          />
          <AdminField
            label={t("planPriceUsdt")}
            name="price_usdt"
            defaultValue={formatUsdt(String(plan.price_usdt))}
            required
            step="0.01"
          />
          <AdminField
            label={t("planPriceIrr")}
            name="price_irr"
            defaultValue={String(plan.price_irr)}
            required
          />
          <AdminField
            label={t("planSortOrder")}
            name="sort_order"
            type="number"
            defaultValue={Number(plan.sort_order)}
          />
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={Boolean(plan.is_active)}
              className="h-3.5 w-3.5 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-brand-600 focus:ring-brand-500/40"
            />
            {t("planActive")}
          </label>
          {err && <FormMessage variant="error">{err}</FormMessage>}
          <FormSubmit loading={loading}>
            {loading ? t("planSaving") : t("planSave")}
          </FormSubmit>
        </form>
        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="mb-3 text-sm text-[var(--muted)]">{t("planDelete")}</p>
          <AdminButton type="button" variant="danger" disabled={deleting || loading} onClick={onDelete}>
            {deleting ? t("planDeleting") : t("planDelete")}
          </AdminButton>
        </div>
      </PanelSection>
    </AdminPage>
  );
}
