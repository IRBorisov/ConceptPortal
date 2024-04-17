# ==========================================
# ============ Multi-stage build ===========
# ==========================================
FROM ubuntu:jammy as python-base

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
        python3.12-dev \
        libstdc++6 && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 && \
    python3.12 -m pip install --upgrade pip && \
    python3.12 -m pip install wheel && \
    apt-get autoclean -y && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ========= Builder ==============
FROM python-base as builder

# Set env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Setup additional dev tools
RUN apt-get update -qq && \
    apt-get full-upgrade -y && \
    apt-get install -y --no-install-recommends \
        software-properties-common \
        build-essential && \
    rm -rf /var/lib/apt/lists/*

# Add GCC compiler
ARG GCC_VER="13"
RUN add-apt-repository -y ppa:ubuntu-toolchain-r/test && \
    apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        gcc-${GCC_VER} \
        g++-${GCC_VER} && \
    update-alternatives --install /usr/bin/gcc gcc $(which gcc-${GCC_VER}) 100 && \
    update-alternatives --install /usr/bin/g++ g++ $(which g++-${GCC_VER}) 100 && \
    rm -rf /var/lib/apt/lists/*

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
COPY apps/ ./apps
COPY project/ ./project
COPY fixtures/ ./fixtures
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