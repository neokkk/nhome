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
RUN yarn set version berry
RUN yarn
RUN yarn workspace server build

FROM builder

EXPOSE 30000

WORKDIR /app/packages/server

RUN chmod u+x ./dist/private.*

CMD ["node", "./dist/main"]
