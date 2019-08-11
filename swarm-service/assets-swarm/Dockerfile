FROM node:latest

RUN mkdir -p /var/www/assets-swarm
WORKDIR /var/www/assets-swarm

COPY ./test ./test
COPY ./src ./src
COPY ./package.json .
COPY ./test-run .

RUN npm install
RUN /bin/bash -c "./test/swarm-up"

EXPOSE 3000
CMD [ "npm", "start" ]
