"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminField } from "@/components/admin/AdminField";
import { PlanDurationFields, planDurationFromForm } from "@/components/admin/PlanDurationFields";
import { PlanTrafficFields, planTrafficFromForm } from "@/components/admin/PlanTrafficFields";
import { PanelPageHeader, PanelSection } from "@/components/layout";
import { FormMessage, FormSubmit } from "@/components/forms";
import { adminCreatePlan, adminGetPaymentSettings, type PaymentSettings } from "@/lib/admin-api";

export default function NewPlanPage() {
  const t = useTranslations("adminPanel");
  const router = useRouter();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    adminGetPaymentSettings().then(setPayment).catch(() => setPayment(null));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    try {
      const body: Record<string, unknown> = {
        slug: fd.get("slug"),
        name: fd.get("name"),
        description: fd.get("description"),
        duration_days: planDurationFromForm(fd),
        traffic_gb: planTrafficFromForm(fd),
        max_devices: Number(fd.get("max_devices") || 1),
        interface_id: Number(fd.get("interface_id") || 1),
        is_active: fd.get("is_active") === "on",
        sort_order: Number(fd.get("sort_order") || 0),
      };
      if (payment?.usdt_enabled) {
        body.price_usdt = fd.get("price_usdt");
      }
      if (payment?.toman_enabled) {
        body.price_irr = fd.get("price_irr");
      }
      await adminCreatePlan(body);
      router.push("/admin/plans");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : t("failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPage>
      <AdminBackLink href="/admin/plans" label={t("backToPlans")} />
      <PanelPageHeader title={t("planNewTitle")} />
      <PanelSection
        title={t("planFormSection")}
        description={t("planFormSectionDesc")}
      >
        <form onSubmit={onSubmit} className="admin-form max-w-md space-y-3" dir="ltr">
          <AdminField label={t("planSlug")} name="slug" required />
          <AdminField label={t("planName")} name="name" required />
          <AdminField label={t("planDescription")} name="description" multiline />
          <PlanDurationFields t={t} />
          <PlanTrafficFields t={t} />
          <AdminField
            label={t("planMaxDevices")}
            name="max_devices"
            type="number"
            min="1"
            defaultValue="1"
            required
          />
          <p className="text-xs text-[var(--muted)] -mt-2">{t("planMaxDevicesHint")}</p>
          <AdminField
            label={t("planInterfaceId")}
            name="interface_id"
            type="number"
            defaultValue="1"
          />
          {payment?.usdt_enabled && (
            <AdminField
              label={t("planPriceUsdt")}
              name="price_usdt"
              required
              step="0.01"
            />
          )}
          {payment?.toman_enabled && (
            <AdminField label={t("planPriceIrr")} name="price_irr" required />
          )}
          <AdminField
            label={t("planSortOrder")}
            name="sort_order"
            type="number"
            defaultValue="0"
          />
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-brand-600 focus:ring-brand-500/40"
            />
            {t("planActive")}
          </label>
          {err && <FormMessage variant="error">{err}</FormMessage>}
          <FormSubmit loading={loading}>
            {loading ? t("planCreating") : t("planCreate")}
          </FormSubmit>
        </form>
      </PanelSection>
    </AdminPage>
  );
}
