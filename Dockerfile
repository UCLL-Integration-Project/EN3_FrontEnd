# ============================================================
# Stage 1 — deps
# Install production dependencies only (cached layer)
# ============================================================
FROM node:18-alpine AS deps

WORKDIR /usr/src/app

# Copy manifest files first for better layer caching
COPY package*.json ./

RUN npm ci --omit=dev

# ============================================================
# Stage 2 — builder
# Install ALL deps (incl. devDeps) and build the app
# ============================================================
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js production bundle
RUN npm run build

# ============================================================
# Stage 3 — runner  (final, smallest image)
# Only the built output + prod deps, no source or devDeps
# ============================================================
FROM node:18-alpine AS runner

# Security: run as non-root
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy built output from builder stage
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json

# Set ownership to non-root user
RUN chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 3000

# Health check — OKD/Kubernetes will use this to determine readiness
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the production Next.js server
CMD ["npm", "run", "start"]
