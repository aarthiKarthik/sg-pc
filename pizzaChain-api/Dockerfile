FROM node:11-alpine

RUN mkdir -p /app
WORKDIR /app

# Install the prerequisites to install the web3 and other ethereum npm packages
RUN apk update && apk upgrade && apk add --no-cache bash git openssh
RUN apk add --update python krb5 krb5-libs gcc make g++ krb5-dev

COPY ./package.json .

RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3003
CMD [ "npm", "start" ]