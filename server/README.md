This is the server for the Notes application, written in Go.

# Usage

Create RSA keypair using the following commands:

```sh
openssl genrsa -out key.pem 2048
openssl rsa -in key.pem -outform PEM -pubout -out public.pem
```

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
