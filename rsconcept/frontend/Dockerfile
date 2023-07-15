# ======== Multi-stage base ==========
FROM node:bullseye-slim as node-base
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

# ======= Build =======
FROM node-base as builder

ENV NODE_ENV production
WORKDIR /result

# Install dependencies
COPY *.json *.js ./
RUN npm ci --only=production

# Build deployment files
COPY ./public ./public
COPY ./src ./src
RUN npm run build

# ========= Server =======
FROM node-base as product-server

ENV NODE_ENV production

# Install serve util
RUN npm install -g serve

# Setup USER
RUN adduser --system --group app
USER node

# Bring up deployment files
WORKDIR /home/node
COPY --chown=node:node --from=builder /result/build ./

# Start server through docker-compose
# serve -s /home/node -l 3000