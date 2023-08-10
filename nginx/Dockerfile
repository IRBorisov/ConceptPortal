FROM nginx:stable-alpine3.17-slim

# Сopу nginx configuration to the proxy-server
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./cert/* /etc/ssl/private/