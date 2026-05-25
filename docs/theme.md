# TakVPN Admin Theme Guide

This project uses a **token-based theme** in `@takvpn/shared` with **class-based dark mode** (`next-themes` adds `class="dark"` on `<html>`).

## CSS variables (surfaces)

Always use semantic tokens for backgrounds, text, borders, and inputs:

| Token | Usage |
|-------|--------|
| `var(--bg)` | Page background |
| `var(--fg)` | Primary text |
| `var(--card)` | Cards, panels, inputs |
| `var(--muted)` | Labels, secondary text |
| `var(--border)` | Borders, dividers |
| `var(--input-bg)` | Form control background |
| `var(--input-border)` | Form control border |

In Tailwind: `bg-[var(--card)]`, `border-[var(--border)]`, `text-[var(--muted)]`, etc.

**Do not use:** `bg-white`, `text-gray-*`, `border-gray-*`, or bare `border` without a token.

## Status colors

Use semantic status tokens (auto-switch in dark mode):

| Token | Usage |
|-------|--------|
| `var(--success)` | Success messages, positive actions |
| `var(--danger)` | Errors, destructive actions |
| `var(--warning)` | Warnings, pending states |
| `var(--danger-border)` | Danger panel borders |
| `var(--danger-bg)` | Danger button hover backgrounds |

**Do not use:** raw `text-red-600`, `bg-green-600`, etc. without tokens.

## Accent (brand)

Primary actions and links use the Tailwind `brand-*` scale defined in `admin-web/tailwind.config.ts` (indigo). Examples: `text-brand-600`, `bg-brand-600`, `hover:bg-brand-700`.

Do not add new accent hex values in components.

## Forms

- Wrap forms in `className="admin-form …" dir="ltr"`.
- Use shared components: `FormField`, `FormSelect`, `FormSubmit`, `FormMessage`.
- Labels align to `start` (RTL-aware) via `panel-form.css`.

## Page layout

- **Container:** `AdminPage` (`max-w-3xl`, vertical spacing).
- **Title:** `PanelPageHeader` (page heading + optional description).
- **Sections:** `PanelSection` (card with title, optional description, children).
- **Actions:** `PanelActionRow` (title, description, action button stacked vertically).

## Admin helpers

- `AdminDataTable` — themed table wrapper (`dir="ltr"` for tabular data).
- `AdminButton` — primary, secondary, danger, success, ghost variants.
- `AdminSearchForm` — search input + submit button.
- `AdminListShell` — loading / error / empty states for lists.

## RTL (Persian / `fa` locale)

- UI is RTL; use **logical** utilities: `text-start`, `ms-auto`, `me-auto`, `ps-*`, `pe-*`.
- **Avoid:** `text-left`, `text-right`, `ml-*`, `mr-*` in admin pages.
- Wrap numbers, dates, emails, and tabular tables in `dir="ltr"` where needed.
- Reference: `plans/page.tsx` table pattern.

## Dark mode

- Surface tokens switch via `.dark` in theme CSS.
- Status tokens switch automatically.
- If you must use Tailwind color scales, always add matching `dark:` variants.

## Imports

`admin-web/src/app/globals.css` must import:

1. `@takvpn/shared/styles/themes/admin.css`
2. `@takvpn/shared/styles/theme-base.css`
3. `@takvpn/shared/styles/panel-form.css`

Tailwind must scan both `admin-web/src/**` and `packages/shared/src/**` (see `tailwind.config.ts`).
