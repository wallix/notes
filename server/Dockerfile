FROM golang:1.12-alpine

ENV GO111MODULE on

RUN apk add --no-cache git build-base

WORKDIR /go/src/github.com/wallix/notes/server
COPY go.mod .
COPY go.sum .

RUN go mod download

# Copy the sources
COPY . /go/src/github.com/wallix/notes/server

RUN go test
RUN go build .

FROM alpine
COPY --from=0 /go/src/github.com/wallix/notes/server/server .
COPY --from=0 /go/src/github.com/wallix/notes/server/*.pem /

CMD [ "./server" ]
