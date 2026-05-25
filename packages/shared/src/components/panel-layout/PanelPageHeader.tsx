import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
};

export function PanelPageHeader({ title, description }: Props) {
  return (
    <header>
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-sm text-[var(--muted)] mt-1">{description}</p>
      )}
    </header>
  );
}
