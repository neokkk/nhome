FROM node:18-alpine as installer

WORKDIR /app
COPY package.json tsconfig.base.json yarn.lock ./
COPY .yarn ./.yarn

WORKDIR /app/packages/server
COPY packages/server/package.json packages/server/nest-cli.json packages/server/tsconfig.json packages/server/tsconfig.build.json ./

WORKDIR /app
RUN yarn set version berry
RUN yarn install

FROM installer as builder

WORKDIR /app
COPY packages/server/src ./packages/server/src
COPY packages/server/lib ./packages/server/lib
COPY packages/server/log ./packages/server/log
COPY --from=installer ./app .

EXPOSE 30000

RUN yarn workspace server build

CMD yarn workspace server start:prod
