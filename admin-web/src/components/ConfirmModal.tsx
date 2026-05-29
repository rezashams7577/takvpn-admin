"use client";

import { useEffect, useId, type ReactNode } from "react";
import { AdminButton } from "@/components/admin/AdminButton";

export type ConfirmVariant = "warning" | "danger";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: ConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
};

const variantAccent: Record<ConfirmVariant, string> = {
  warning: "border-amber-500/40",
  danger: "border-red-500/40",
};

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  variant = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
}: ConfirmModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, loading]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={cancelLabel}
        disabled={loading}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md rounded-lg border bg-[var(--card)] p-6 shadow-xl ${variantAccent[variant]}`}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div className="mt-3 text-sm text-[var(--muted)]">{message}</div>
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            type="button"
            variant="danger"
            disabled={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
