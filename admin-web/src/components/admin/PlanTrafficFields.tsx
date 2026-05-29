"use client";

import { useState } from "react";
import { AdminField } from "@/components/admin/AdminField";

export function planTrafficFromForm(fd: FormData): string {
  if (fd.get("traffic_unlimited") === "on") {
    return "";
  }
  return String(fd.get("traffic_gb") ?? "").trim();
}

export function PlanTrafficFields({
  t,
  defaultUnlimited = false,
  defaultGb = "",
}: {
  t: (key: string) => string;
  defaultUnlimited?: boolean;
  defaultGb?: string;
}) {
  const [noDataLimit, setNoDataLimit] = useState(defaultUnlimited);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <input
          name="traffic_unlimited"
          type="checkbox"
          checked={noDataLimit}
          onChange={(e) => setNoDataLimit(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-[var(--input-border)] bg-[var(--input-bg)] text-brand-600 focus:ring-brand-500/40"
        />
        {t("planTrafficUnlimited")}
      </label>
      <AdminField
        label={t("planTrafficGb")}
        name="traffic_gb"
        type="number"
        step="0.01"
        min="0"
        defaultValue={defaultGb}
        disabled={noDataLimit}
        required={!noDataLimit}
      />
      <p className="text-xs text-[var(--muted)]">{t("planTrafficUnlimitedHint")}</p>
    </div>
  );
}
