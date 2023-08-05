# ==========================================
# ============ Multi-stage build ===========
# ==========================================
FROM ubuntu:jammy as python-base

RUN apt-get update -qq && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \ 
        python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && \
    pip install wheel

# ========= Builder ==============
FROM python-base as builder

# Set env variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt ./
COPY ./import/*linux*.whl ./wheels/
RUN pip wheel \
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
    adduser --system --group app

# Install python dependencies
WORKDIR $APP_HOME
COPY --from=builder /wheels /wheels
RUN pip install --no-cache /wheels/* && \
    rm -rf /wheels

# Copy application sources and setup permissions
COPY apps/ ./apps
COPY project/ ./project
COPY data/ ./data
COPY manage.py entrypoint.sh ./
RUN sed -i 's/\r$//g'  $APP_HOME/entrypoint.sh && \
    chmod +x  $APP_HOME/entrypoint.sh && \
    chown -R app:app $APP_HOME && \
    chmod -R a+rwx $APP_HOME/static && \
    chmod -R a+rwx $APP_HOME/media

RUN 

USER app
WORKDIR $APP_HOME

ENTRYPOINT ["sh", "entrypoint.sh"]