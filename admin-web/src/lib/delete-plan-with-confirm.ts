import { adminDeletePlan, PlanHasOrdersError } from "@/lib/admin-api";
import type { ConfirmOptions } from "@/components/useConfirmDialog";

type TranslateFn = (
  key: string,
  values?: Record<string, string | number | Date>
) => string;

export async function deletePlanWithConfirm(
  plan: { id: number; name: string },
  ask: (options: ConfirmOptions) => Promise<boolean>,
  t: TranslateFn,
  handlers: {
    onDeleted: () => void;
    onError: (message: string) => void;
  }
) {
  const labels = {
    confirmLabel: t("modalConfirm"),
    cancelLabel: t("modalCancel"),
  };

  const confirmed = await ask({
    title: t("planDeleteTitle"),
    message: t("planDeleteConfirm", { name: plan.name }),
    variant: "danger",
    ...labels,
  });
  if (!confirmed) return;

  try {
    await adminDeletePlan(plan.id);
    handlers.onDeleted();
  } catch (e) {
    if (e instanceof PlanHasOrdersError) {
      const cascadeConfirmed = await ask({
        title: t("planDeleteCascadeTitle"),
        message: t("planDeleteCascadeConfirm", {
          name: plan.name,
          count: e.orderCount,
        }),
        variant: "warning",
        ...labels,
      });
      if (!cascadeConfirmed) return;
      try {
        await adminDeletePlan(plan.id, true);
        handlers.onDeleted();
      } catch (e2) {
        handlers.onError(e2 instanceof Error ? e2.message : t("failed"));
      }
      return;
    }
    handlers.onError(e instanceof Error ? e.message : t("failed"));
  }
}
