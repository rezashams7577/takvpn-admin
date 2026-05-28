import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
  minWidth?: string;
};

export function AdminDataTable({
  children,
  className = "",
  dir = "ltr",
  minWidth,
}: Props) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-[var(--border)] ${className}`.trim()}
      dir={dir}
    >
      <table
        className="w-full text-sm border-collapse"
        style={minWidth ? { minWidth } : undefined}
      >
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--border)] text-[var(--muted)]">
        {children}
      </tr>
    </thead>
  );
}

export function AdminTableTh({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-4 py-3 text-start font-medium ${className}`.trim()}>
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function AdminTableRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={`border-b border-[var(--border)] last:border-b-0 ${className}`.trim()}>
      {children}
    </tr>
  );
}

export function AdminTableTd({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td title={title} className={`px-4 py-3 text-start ${className}`.trim()}>
      {children}
    </td>
  );
}
