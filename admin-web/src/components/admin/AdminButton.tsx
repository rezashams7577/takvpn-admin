import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "danger" | "success" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50",
  secondary:
    "border border-[var(--border)] text-[var(--fg)] hover:bg-brand-50 dark:hover:bg-brand-900/30",
  danger:
    "border border-[var(--danger-border)] text-[var(--danger-muted)] hover:bg-[var(--danger-bg)] disabled:opacity-50",
  success:
    "bg-[var(--success)] text-white hover:opacity-90 disabled:opacity-50",
  ghost:
    "text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30",
};

function buildClass(variant: Variant, className: string) {
  return `inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium ${variantClasses[variant]} ${className}`.trim();
}

type ButtonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  href?: undefined;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type LinkProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  href: string;
};

export function AdminButton(props: ButtonProps | LinkProps) {
  const { variant = "primary", children, className = "" } = props;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={buildClass(variant, className)}>
        {children}
      </Link>
    );
  }

  const { href: _h, ...buttonProps } = props as ButtonProps;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={buildClass(variant, className)}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
