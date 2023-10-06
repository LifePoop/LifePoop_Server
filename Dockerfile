FROM node:20-alpine3.17

COPY . .

RUN yarn install
RUN yarn build

ENTRYPOINT ["node", "dist/src/main.js"]
