# Set the base image to Ubuntu
FROM node

# File Author / Maintainer
MAINTAINER Gabriel Malet

# Install PM2
RUN npm install -g pm2

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src/

# Define working directory
WORKDIR /src
ADD . /src

# Translation (fr)
COPY p.json /src/pokemons.json

# Run app
CMD pm2 start --no-daemon processes.json