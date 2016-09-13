#!/bin/bash

set -e

for CONF_FILE in `find /src/nginx/sites-enabled -type f -name "*.conf"`; do
	sed -i -e "s/__NGINX_DOMAIN__/$NGINX_DOMAIN/g" \
		-e "s#__NGINX_SSL_CERT__#$NGINX_SSL_CERT#g" \
		-e "s#__NGINX_SSL_CERT_KEY__#$NGINX_SSL_CERT_KEY#g" $CONF_FILE
done;

cp -rp /src/nginx/sites-enabled /nginx

exec "$@"