"use client";

import type { FormEvent, ReactNode } from "react";
import { AdminButton } from "./AdminButton";

type Props = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  submitLabel: string;
  children?: ReactNode;
  className?: string;
};

export function AdminSearchForm({
  onSubmit,
  value,
  onChange,
  placeholder,
  submitLabel,
  children,
  className = "",
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className={`admin-form flex flex-wrap items-end gap-2 ${className}`.trim()}
      dir="ltr"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-field-control flex-1 min-w-[12rem]"
      />
      <AdminButton type="submit" variant="primary">
        {submitLabel}
      </AdminButton>
      {children}
    </form>
  );
}
