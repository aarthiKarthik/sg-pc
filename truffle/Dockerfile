FROM node:11-alpine

USER root

RUN mkdir -p /truffle
WORKDIR /truffle

# Install the prerequisites to install the web3 and other ethereum npm packages
RUN apk update && apk upgrade && apk add --no-cache bash git openssh
RUN apk add --update python krb5 krb5-libs gcc make g++ krb5-dev

# Copy the package.json
COPY ./package.json truffle.js truffle-config.js ./

# Install the dependencies
RUN npm install --unsafe-perm

ENV TRUFFLE_VERSION=5.0.18
RUN npm install -g truffle@${TRUFFLE_VERSION} --unsafe-perm

# Copy the server and ethereum module
COPY . .

RUN truffle test