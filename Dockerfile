# ============================================================
# Stage 1 — builder
# Install ALL deps and build the Next.js standalone bundle
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# NEXT_PUBLIC_* vars must be available at BUILD time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js production bundle
# Requires: output: 'standalone' in next.config.js
RUN npm run build

# ============================================================
# Stage 2 — runner  (final image)
# Uses standard Next.js build output to support custom server.js
# ============================================================
FROM node:20-alpine AS runner

# Security: run as non-root
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Copy necessary project files and dependencies
COPY --from=builder --chown=appuser:appgroup /usr/src/app/next.config.ts ./
COPY --from=builder --chown=appuser:appgroup /usr/src/app/public ./public
COPY --from=builder --chown=appuser:appgroup /usr/src/app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /usr/src/app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /usr/src/app/server.js ./server.js

USER appuser

EXPOSE 8080

# Health check — OKD/Kubernetes uses this for readiness/liveness
# Check both HTTPS and HTTP to be safe, ignore cert errors for internal check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- --no-check-certificate https://localhost:8080/ || wget -qO- http://localhost:8080/ || exit 1        

# Run the custom server
CMD ["node", "server.js"]
