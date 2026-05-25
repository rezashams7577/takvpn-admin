import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action: ReactNode;
  variant?: "default" | "danger";
};

export function PanelActionRow({
  title,
  description,
  action,
  variant = "default",
}: Props) {
  return (
    <div className="space-y-3 py-4 border-b border-[var(--border)] last:border-b-0">
      <div className="min-w-0">
        <p
          className={`text-sm font-medium ${
            variant === "danger"
              ? "text-[var(--danger-muted)]"
              : "text-[var(--fg)]"
          }`}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div>{action}</div>
    </div>
  );
}
