/// <reference types="Node" />
if (global["TextEncoder"] === undefined) {
  global["TextEncoder"] = require("text-encoding").TextEncoder;
}
if (global["TextDecoder"] === undefined) {
  global["TextDecoder"] = require("text-encoding").TextDecoder;
}
if (global["btoa"] === undefined) {
  global["btoa"] = require("btoa");
}
if (global["atob"] === undefined) {
  global["atob"] = require("atob");
}
if (global["XMLHttpRequest"] === undefined) {
  global["XMLHttpRequest"] = require("xhr2");
}
if (global["WebSocket"] === undefined) {
  global["WebSocket"] = require("ws");
}

const DataPeps = require("datapeps-sdk");
const fs = require("fs");
const crypto = require("crypto"),
  shasum = crypto.createHash("sha1");

if (process.env.PEPSCRYPTO_HOST) {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
  let APIHost = "https://" + process.env.PEPSCRYPTO_HOST;
  DataPeps.configure(APIHost);
}

const login = process.env.DATAPEPS_LOGIN || "myprivatenotes.tester";
const password = process.env.DATAPEPS_PASSWORD || "Azertyuiop33";

const createApp = async () => {
  const key = fs.readFileSync(__dirname + "/../../server/public.pem", {
    encoding: "utf-8"
  });
  shasum.update(key);
  const seed = shasum.digest("hex").substring(0, 8);

  const loginApp = "Notes.tmp." + seed;

  let session = await DataPeps.login(login, password);
  let created = false;

  try {
    await session.Identity.create(
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

  fs.writeFileSync(
    __dirname + "/../.env.local",
    `REACT_APP_DATAPEPS_APP_ID=${loginApp}`
  );
  fs.writeFileSync(
    __dirname + "/../.env.test",
    `REACT_APP_DATAPEPS_APP_ID=${loginApp}`
  );

  await session.Application.putConfig(loginApp, {
    key: new TextEncoder().encode(key),
    signAlgorithm: DataPeps.ApplicationJwtAlgorithm.RS256,
    claimForLogin: "id"
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
