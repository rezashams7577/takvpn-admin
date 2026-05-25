"use client";

import type { ReactNode } from "react";

export type FormMessageProps = {
  variant?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
};

export function FormMessage({
  variant = "error",
  children,
  className = "",
}: FormMessageProps) {
  const color =
    variant === "success"
      ? "text-[var(--success)]"
      : variant === "info"
        ? "text-brand-600"
        : "text-[var(--danger)]";
  return <p className={`text-sm ${color} ${className}`.trim()}>{children}</p>;
}
