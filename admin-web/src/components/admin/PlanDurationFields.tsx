"use client";

import { useState } from "react";
import { AdminField } from "@/components/admin/AdminField";

export function planDurationFromForm(fd: FormData): number | null {
  if (fd.get("duration_unlimited") === "on") {
    return null;
  }
  const raw = String(fd.get("duration_days") ?? "").trim();
  if (!raw) {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function PlanDurationFields({
  t,
  defaultUnlimited = false,
  defaultDays = 30,
}: {
  t: (key: string) => string;
  defaultUnlimited?: boolean;
  defaultDays?: number;
}) {
  const [noTimeLimit, setNoTimeLimit] = useState(defaultUnlimited);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <input
          name="duration_unlimited"
          type="checkbox"
          checked={noTimeLimit}
          onChange={(e) => setNoTimeLimit(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-brand-600 focus:ring-brand-500/40"
        />
        {t("planDurationUnlimited")}
      </label>
      <AdminField
        label={t("planDurationDays")}
        name="duration_days"
        type="number"
        min="1"
        defaultValue={defaultDays}
        disabled={noTimeLimit}
        required={!noTimeLimit}
      />
      <p className="text-xs text-[var(--muted)]">{t("planDurationUnlimitedHint")}</p>
    </div>
  );
}
