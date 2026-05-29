"use client";

import { useCallback, useState, type ReactNode } from "react";
import { ConfirmModal, type ConfirmVariant } from "@/components/ConfirmModal";

export type ConfirmOptions = {
  title: string;
  message: ReactNode;
  variant?: ConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const finish = useCallback((result: boolean) => {
    setPending((current) => {
      current?.resolve(result);
      return null;
    });
    setLoading(false);
  }, []);

  function ConfirmDialog() {
    if (!pending) return null;
    return (
      <ConfirmModal
        open
        title={pending.title}
        message={pending.message}
        variant={pending.variant ?? "danger"}
        confirmLabel={pending.confirmLabel}
        cancelLabel={pending.cancelLabel}
        loading={loading}
        onConfirm={() => finish(true)}
        onCancel={() => finish(false)}
      />
    );
  }

  return { ask, ConfirmDialog, setConfirmLoading: setLoading };
}
