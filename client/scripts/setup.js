#! /usr/bin/env node
/// <reference types="Node" />
if (global["fetch"] === undefined) {
  global["fetch"] = require("node-fetch");
}
if (global["Headers"] === undefined) {
  global["Headers"] = require("node-fetch").Headers;
}

const DataPeps = require("datapeps-sdk");
const fs = require("fs");
const crypto = require("crypto"),
  shasum = crypto.createHash("sha1");

let APIHost = "https://api.datapeps.com";

if (process.env.DATAPEPS_API_HOST) {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  APIHost = "https://" + process.env.DATAPEPS_API_HOST;
  DataPeps.configure(APIHost);
}

const login = process.env.DATAPEPS_LOGIN || "cypress.tester";
const password = process.env.DATAPEPS_PASSWORD || "Azertyuiop33";

const createApp = async () => {
  const key = fs.readFileSync(__dirname + "/../../server/public.pem", {
    encoding: "utf-8"
  });
  shasum.update(key);
  const seed = shasum.digest("hex").substring(0, 8);

  const loginApp = "Notes." + seed;

  let session = await DataPeps.Session.login(login, password);
  let created = false;

  try {
    await new DataPeps.IdentityAPI(session).create(
      {
        login: loginApp,
        kind: "pepsswarm/3",
        name: `My Private Note (${seed})`,
        payload: new TextEncoder().encode(
          JSON.stringify({
            description: `My Private Note #${seed}`
          })
        )
      },
      { sharingGroup: [login] }
    );
    created = true;
  } catch (e) {
    if ("kind" in e && e.kind === DataPeps.ServerError.IdentityAlreadyExists) {
      // Ok that's fine
    } else {
      throw e;
    }
  }

  const dotEnv = `REACT_APP_DATAPEPS_API=${APIHost}\nREACT_APP_API_URL=http://localhost:8080\nREACT_APP_DATAPEPS_APP_ID=${loginApp}`;

  fs.writeFileSync(__dirname + "/../.env.local", dotEnv);
  fs.writeFileSync(__dirname + "/../.env.test", dotEnv);

  await new DataPeps.ApplicationAPI(session).putConfig(loginApp, {
    jwt: {
      key: new TextEncoder().encode(key),
      signAlgorithm: DataPeps.ApplicationJWT.Algorithm.RS256,
      claimForLogin: "id"
    }
  });

  return { login: loginApp, success: true, created };
};

createApp()
  .then(app => {
    console.log(JSON.stringify(app));
    process.exit();
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
