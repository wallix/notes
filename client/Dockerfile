FROM node:11-alpine

WORKDIR /home/node

ADD package.json .
ADD package-lock.json .
RUN npm ci --only=prod

ADD . /home/node
RUN npm run build

FROM node:11-alpine
RUN npm install -g serve
COPY --from=0 /home/node/build /build

ENTRYPOINT [ "serve", "-s", "build" ]
