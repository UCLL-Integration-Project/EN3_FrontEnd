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
# Stage 2 — runner  (final, smallest image)
# Uses the self-contained standalone output — no node_modules
# needed in the final image, no npm, just node + server.js
# ============================================================
FROM node:20-alpine AS runner

# Security: run as non-root
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# .next/standalone contains server.js + its own minimal node_modules
COPY --from=builder --chown=appuser:appgroup /usr/src/app/.next/standalone ./
# Overwrite the default server.js with our custom one that handles HTTPS
COPY --from=builder --chown=appuser:appgroup /usr/src/app/server.js ./server.js

# Static assets must be copied separately on top of standalone
COPY --from=builder --chown=appuser:appgroup /usr/src/app/.next/static ./.next/static

# Public folder (images, fonts, etc.)
COPY --from=builder --chown=appuser:appgroup /usr/src/app/public ./public

USER appuser

EXPOSE 8080

# Health check — OKD/Kubernetes uses this for readiness/liveness
# Check both HTTPS and HTTP to be safe, ignore cert errors for internal check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- --no-check-certificate https://localhost:8080/ || wget -qO- http://localhost:8080/ || exit 1

# Run the standalone server directly — no npm needed
CMD ["node", "server.js"]
