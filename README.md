# Notes

Notes is simple note-taking application, which serves as a demo for [DataPeps](https://datapeps.com). This application may also be a good starter for anyone interested in the Go/React stack.

![Mandatory screenshot](https://user-images.githubusercontent.com/33936597/50092430-604d7f00-020e-11e9-9284-7b2b142c7b5d.png)

# Directory structure

- `/server` contains a REST service built with Go and SQLite
- `/client` contains a web client built with React

Please refer to each directory README to build and run.

# Adding DataPeps

Notes was built as a tutorial for the implementention of [End-to-End Encryption (E2EE)](https://en.wikipedia.org/wiki/End-to-end_encryption) with [DataPeps](https://github.com/wallix/datapeps-sdk-js). Thanks to E2EE, Notes will be strongly protected with encryption performed directly on client devices. Anyone that can access servers legally (admins, ...) or not (attackers, ...) will not be able to read user information.

Adding DataPeps support requires **no modification of the server code**. Only the `client/` needs to be updated.

To add DataPeps support, awaiting the forthcoming blog post:

1. Create a DataPeps app on [datapeps.com](https://datapeps.com)
2. Add the `datapeps-sdk` to the client by running `npm i datapeps-sdk --save` in the `client/` directory
3. Look for the `@DATAPEPS` comments in the `client/src` codebase and uncomment or substitute code fragments. If you have knowledge of React, all modifications should be trivial to read and implement.

There are [wonderful slides](https://github.com/wallix/notes/files/2686280/DataPeps.Notes.Demo.pdf) available as well. And if they're not, please tell us in the issues!

# Warning

Passwords are stored unencrypted in the database. It is not a problem when using Notes with DataPeps, but it should not be run  as such without.

# License

Released under the Apache License
