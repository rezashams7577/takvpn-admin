"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type Props = {
  loading: boolean;
  error?: string;
  empty: boolean;
  children: ReactNode;
};

export function AdminListShell({ loading, error, empty, children }: Props) {
  const t = useTranslations("adminPanel");

  if (loading) {
    return <p className="mt-6 text-sm text-[var(--muted)]">{t("loading")}</p>;
  }
  if (error) {
    return <p className="mt-4 text-sm text-red-600">{error}</p>;
  }
  if (empty) {
    return <p className="mt-6 text-sm text-[var(--muted)]">{t("noRecords")}</p>;
  }
  return <>{children}</>;
}
