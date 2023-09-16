FROM nginx:stable-alpine3.17-slim
ARG BUILD_TYPE=production

# Сopу nginx configuration to the proxy-server
COPY ./$BUILD_TYPE.conf /etc/nginx/conf.d/default.conf
COPY ./cert/*.pem /etc/ssl/private/