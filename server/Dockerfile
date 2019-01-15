FROM golang:1.11-alpine3.8

RUN apk -U add git make g++

ADD . /opt/server
WORKDIR /opt/server

RUN go build .

FROM alpine:3.8
COPY --from=0 /opt/server/server .
CMD ["./server"]
