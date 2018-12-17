# Notes

Notes is simple note-taking application, which serves as a demo for [DataPeps](https://datapeps.com). This application may also be a good starter for anyone interested in the Go/React stack.

![Mandatory screenshot](https://user-images.githubusercontent.com/33936597/50091011-69d4e800-020a-11e9-95dc-29cfa32e7c9b.png)

# Directory structure

- `/server` contains a REST service built with Go and SQLite
- `/client` contains a web client built with React

Please refer to each directory README to build and run.

# Adding DataPeps

This application is meant as a tutorial to implement [End-to-End Encryption (E2EE)](https://en.wikipedia.org/wiki/End-to-end_encryption) with DataPeps on your own. Thanks to E2EE, your Notes are strongly protected with encryption performed directly on your browser and/or device. People that can access servers legally (admins, ...) or not (attackers, ...) will not be able to read your information.

Adding DataPeps support requires **no modification of the server code**. Only the `client/` needs to be updated.

To add DataPeps support, awaiting the forthcoming blog post:

1. Create a DataPeps app on [datapeps.com](https://datapeps.com)
2. Add the `datapeps-sdk` to the client by running `npm i datapeps-sdk --save` in the `client/` directory
3. Look for the `@DATAPEPS` comments in the `client/src` codebase and uncomment or substitute code fragments. If you have knowledge of React, all modifications should be trivial to read and implement.

# License

Released under the Apache License
