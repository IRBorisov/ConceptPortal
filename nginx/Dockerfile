FROM nginx:stable-alpine3.24-slim
ARG BUILD_TYPE=production

# Сopу nginx configuration to the proxy-server
COPY ./$BUILD_TYPE.conf /etc/nginx/conf.d/default.conf