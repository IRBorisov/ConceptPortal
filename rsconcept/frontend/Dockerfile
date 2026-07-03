# ======== Multi-stage base ==========
FROM node:24-bookworm-slim AS node-base
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*
RUN corepack enable

# ======= Build =======
ARG BUILD_TYPE=production
FROM node-base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY rsconcept/domain/package.json rsconcept/domain/
COPY rsconcept/frontend/package.json rsconcept/frontend/
RUN pnpm install --frozen-lockfile --filter frontend...

COPY rsconcept/domain rsconcept/domain
COPY rsconcept/frontend rsconcept/frontend
COPY rsconcept/frontend/env/.env.$BUILD_TYPE rsconcept/frontend/.env
RUN rm -rf rsconcept/frontend/env

ENV NODE_ENV=production
RUN pnpm --filter @rsconcept/domain run build
WORKDIR /app/rsconcept/frontend
RUN pnpm run build

# ========= Server =======
FROM node-base AS product-server

ENV NODE_ENV=production

# Install serve util
RUN npm install -g serve

# Setup USER
RUN adduser --system --group app
USER node

# Bring up deployment files
WORKDIR /home/node
COPY --chown=node:node --from=builder /app/rsconcept/frontend/dist ./

# Start server through docker-compose
# serve -s /home/node -l 3000
