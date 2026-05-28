# Build from repo root: docker build -t takvpn-admin .
ARG REGISTRY=docker.io/library
ARG NPM_REGISTRY=https://registry.npmjs.org/

FROM ${REGISTRY}/node:20-alpine AS deps
ARG NPM_REGISTRY
WORKDIR /app
COPY packages/shared/package.json packages/shared/
COPY admin-web/package.json admin-web/package-lock.json* admin-web/.npmrc* ./admin-web/
COPY packages/shared ./packages/shared
WORKDIR /app/packages/shared
RUN npm config set registry "${NPM_REGISTRY}" \
    && npm install
WORKDIR /app/admin-web
RUN npm config set registry "${NPM_REGISTRY}" \
    && npm install

FROM ${REGISTRY}/node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/admin-web/node_modules ./admin-web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/shared ./packages/shared
COPY admin-web ./admin-web
WORKDIR /app/admin-web
ARG API_INTERNAL_URL=http://127.0.0.1:8080
ARG NEXT_PUBLIC_USER_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_ADMIN_APP_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3001
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV NEXT_PUBLIC_USER_APP_URL=$NEXT_PUBLIC_USER_APP_URL
ENV NEXT_PUBLIC_ADMIN_APP_URL=$NEXT_PUBLIC_ADMIN_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM ${REGISTRY}/node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/admin-web/public ./admin-web/public
COPY --from=builder --chown=nextjs:nodejs /app/admin-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/admin-web/.next/static ./admin-web/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "admin-web/server.js"]
