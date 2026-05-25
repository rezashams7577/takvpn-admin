# TakVPN — Admin Panel

Standalone Next.js admin UI for TakVPN staff.

## Related repos

| Repo | Purpose |
|------|---------|
| [takvpn-ui](https://github.com/rezashams7577/takvpn-ui) | Customer site + user dashboard |
| [takvpn-backend](https://github.com/rezashams7577/takvpn-backend) | Go API |

## Repository layout

```
packages/shared/   # Shared forms, theme CSS, API helpers
admin-web/         # Next.js admin app
docs/theme.md      # UI theme conventions (tokens, layout, RTL)
scripts/check-theme.sh  # Lint styling drift in admin-web
```

## Local development

```bash
cp .env.example .env
# Set API_INTERNAL_URL to your backend

cd admin-web && npm install && npm run dev
```

Open http://localhost:3000 (or port shown in terminal).

## Docker (production)

```bash
cp .env.example .env
docker compose up -d --build
```

Default host port: **3001** (maps to container 3000).

## Environment

| Variable | Description |
|----------|-------------|
| `API_INTERNAL_URL` | Backend for `/api/*` rewrites |
| `NEXT_PUBLIC_ADMIN_APP_URL` | Public admin URL (build-time) |
| `NEXT_PUBLIC_USER_APP_URL` | Customer site URL for links (build-time) |

Ensure backend `CORS_ORIGINS` includes your admin domain.
