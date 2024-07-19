# ==========================================
# ============ Multi-stage build ===========
# ==========================================
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
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 && \
    python3.12 -m pip install --upgrade pip && \
    python3.12 -m pip install wheel && \
    apt-get autoclean -y && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ========= Builder ==============
FROM python-base AS builder

# Set env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt ./
RUN python3.12 -m pip wheel \
        --no-cache-dir --no-deps \
        --wheel-dir=/wheels -r requirements.txt


# ======== Application ============
FROM python-base

# Install security updates and system packages
RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get install -y \ 
        netcat && \
    rm -rf /var/lib/apt/lists/*

# Setup the app user
ENV USER_HOME=/home/app
ENV APP_HOME=/home/app/web

RUN mkdir -p $USER_HOME && \
    mkdir -p $APP_HOME && \
    mkdir -p $APP_HOME/static && \
    mkdir -p $APP_HOME/media && \
    mkdir -p $APP_HOME/backup && \
    adduser --system --group app

# Install python dependencies
WORKDIR $APP_HOME
COPY --from=builder /wheels /wheels
RUN pip install --no-cache /wheels/* && \
    rm -rf /wheels

# Copy application sources and setup permissions
COPY project/ ./project
COPY shared/ ./shared
COPY fixtures/ ./fixtures
COPY apps/ ./apps
COPY manage.py entrypoint.sh ./
RUN sed -i 's/\r$//g'  $APP_HOME/entrypoint.sh && \
    chmod +x $APP_HOME/entrypoint.sh && \
    chown -R app:app $APP_HOME && \
    chmod -R a+rwx $APP_HOME/static && \
    chmod -R a+rwx $APP_HOME/media && \
    chmod -R a+rwx $APP_HOME/backup

RUN 

USER app
WORKDIR $APP_HOME

ENTRYPOINT ["sh", "entrypoint.sh"]