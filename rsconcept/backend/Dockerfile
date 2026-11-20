# ==========================================
# ============ Multi-stage build ===========
# ==========================================
FROM node:26-bookworm-slim AS model-types

RUN npm install -g corepack && corepack enable
WORKDIR /src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY rsconcept/domain/package.json rsconcept/domain/
RUN pnpm install --frozen-lockfile --filter @rsconcept/domain
COPY rsconcept/domain rsconcept/domain
RUN pnpm --filter @rsconcept/domain run build:model-types

FROM ubuntu:jammy AS python-base

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qq && \
    apt-get full-upgrade -y && \
    apt-get install -y --no-install-recommends \
        curl \
        gpg-agent \
        software-properties-common && \
    add-apt-repository -y ppa:deadsnakes/ppa && \
    add-apt-repository -y ppa:ubuntu-toolchain-r/test && \
    apt-get install -y --no-install-recommends \
        python3.12 \
        libstdc++6 && \
    rm -rf /usr/lib/python3/dist-packages/pkg_resources* /usr/lib/python3.12/pkgutil.pyc && \
    apt-get autoclean -y && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ========= Builder ==============
FROM python-base AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.7 /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_LINK_MODE=copy
ENV UV_COMPILE_BYTECODE=1
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

WORKDIR /tmp/backend

COPY rsconcept/backend/.python-version rsconcept/backend/pyproject.toml rsconcept/backend/uv.lock ./
RUN uv sync --frozen --no-dev


# ======== Application ============
FROM python-base

RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        netcat && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Setup the app user
ENV USER_HOME=/home/app
ENV APP_HOME=/home/app/web
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN mkdir -p $USER_HOME && \
    mkdir -p $APP_HOME && \
    mkdir -p $APP_HOME/static && \
    mkdir -p $APP_HOME/media && \
    mkdir -p $APP_HOME/backup && \
    adduser --system --group app

# Install Python dependencies from the locked uv environment.
COPY --from=builder /opt/venv $VIRTUAL_ENV
COPY --from=model-types /usr/local/bin/node /usr/local/bin/node

# Copy application sources and setup permissions
WORKDIR $APP_HOME
COPY --from=model-types /src/rsconcept/backend/build/model-types ./build/model-types
RUN node --version
COPY rsconcept/backend/pyproject.toml ./
COPY rsconcept/backend/project/ ./project
COPY rsconcept/backend/shared/ ./shared
COPY rsconcept/backend/templates/ ./templates
COPY rsconcept/backend/fixtures/ ./fixtures
COPY rsconcept/backend/apps/ ./apps
COPY rsconcept/backend/manage.py rsconcept/backend/entrypoint.sh ./
RUN sed -i 's/\r$//g' $APP_HOME/entrypoint.sh && \
    chmod +x $APP_HOME/entrypoint.sh && \
    chown -R app:app $APP_HOME && \
    chmod -R a+rwx $APP_HOME/static && \
    chmod -R a+rwx $APP_HOME/media && \
    chmod -R a+rwx $APP_HOME/backup

USER app
WORKDIR $APP_HOME

ENTRYPOINT ["sh", "entrypoint.sh"]
