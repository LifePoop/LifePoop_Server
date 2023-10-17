FROM node:20-alpine3.17

COPY . ./app

RUN cd app && yarn install
RUN cd app && yarn build

ENTRYPOINT ["node", "app/dist/src/main.js"]
