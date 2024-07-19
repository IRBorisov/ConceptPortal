# ======== Multi-stage base ==========
FROM node:20-bullseye-slim AS node-base
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# ======= Build =======
ARG BUILD_TYPE=production
FROM node-base AS builder

WORKDIR /result

COPY ./ ./
COPY ./env/.env.$BUILD_TYPE ./
RUN rm -rf ./env
RUN npm ci
ENV NODE_ENV production
RUN npm run build

# ========= Server =======
FROM node-base AS product-server

ENV NODE_ENV production

# Install serve util
RUN npm install -g serve

# Setup USER
RUN adduser --system --group app
USER node

# Bring up deployment files
WORKDIR /home/node
COPY --chown=node:node --from=builder /result/dist ./

# Start server through docker-compose
# serve -s /home/node -l 3000