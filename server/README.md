This is the server for the Notes application, written in Go.

# Quick start

Download go modules dependencies:

```sh
go mod download
```

Building the server:

```sh
go build
```

Create RSA keypair:

```sh
openssl genrsa -out key.pem 2048
openssl rsa -in key.pem -outform PEM -pubout -out public.pem
```

Running the server:

```sh
./server
```

# Usage

Create a new user:

```sh
http -v --json POST localhost:8080/subscribe username=admin password=admin
```

Login:

```sh
http -v --json POST localhost:8080/login username=admin password=admin
```

Create a note:

```sh
http -f POST localhost:8000/auth/notes "Authorization:Bearer xxxxxxxxx"  "Content-Type: application/json" title="Cool Title" content="And an awesome content."
```

Get all notes:

```sh
http -f GET localhost:8000/auth/notes "Authorization:Bearer xxxxxxxxx"  "Content-Type: application/json"
```

where xxxxxxxxx is the full token.

# About

Licensed under the Apache license.

(c) WALLIX, written by Henri Binsztok.
