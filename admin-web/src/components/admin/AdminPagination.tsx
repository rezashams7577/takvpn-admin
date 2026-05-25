"use client";

import { AdminButton } from "./AdminButton";

type Props = {
  page: number;
  pageLabel: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
};

export function AdminPagination({
  page,
  pageLabel,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
}: Props) {
  return (
    <div className="mt-4 flex gap-2 items-center">
      <AdminButton variant="secondary" disabled={prevDisabled} onClick={onPrev}>
        Prev
      </AdminButton>
      <span className="text-sm text-[var(--muted)]">
        {pageLabel} {page}
      </span>
      <AdminButton variant="secondary" disabled={nextDisabled} onClick={onNext}>
        Next
      </AdminButton>
    </div>
  );
}
