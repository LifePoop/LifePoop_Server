FROM node:20-alpine3.17

WORKDIR /app

COPY . ./app

RUN yarn install
RUN yarn build

ENTRYPOINT ["node", "dist/src/main.js"]
