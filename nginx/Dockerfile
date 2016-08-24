# Set nginx base image (based on alpine)
FROM nginx

# File Author / Maintainer
MAINTAINER Gabriel Malet

# Copy custom configuration file from the current directory
COPY nginx.conf /etc/nginx/nginx.conf
COPY sites-enabled/bot-skype.conf /etc/nginx/sites-enabled/bot-skype.conf

COPY ./scripts/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# 443 Expose ports (SSL)
EXPOSE 443

# Define default command
CMD service nginx start