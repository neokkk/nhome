FROM node:18-alpine as builder

WORKDIR /app
COPY package.json tsconfig.base.json yarn.lock .yarnrc.yml ./

WORKDIR /app/packages/server
COPY packages/server/package.json \
  packages/server/nest-cli.json \
  packages/server/tsconfig.* \
  packages/server/main.ts \
  packages/server/private.* \
  ./
COPY packages/server/src ./src

WORKDIR /app
RUN apk add sudo
RUN yarn set version berry &&\
  yarn &&\
  yarn workspace server build

FROM builder

EXPOSE 30000

WORKDIR /app/packages/server

RUN chmod u+x ./dist/private.*
RUN sudo -i mkdir /var/log/dht11 && sudo chmod 1777 /var/log/dht11

CMD ["node", "./dist/main"]
