import { ApplicationJWT, IdentityAPI, SDKError } from "datapeps-sdk";
import { handleResponse } from "./utils";
import store from "../store";

export async function login(username, password) {
  try {
    const connector = {
      createSession: async (login, password) =>
        await loginNotes(login, password),
      getToken: async user => user.token
    };
    const {
      session: datapeps,
      appSession: user
    } = await ApplicationJWT.createSession(
      process.env.REACT_APP_DATAPEPS_APP_ID,
      username,
      password,
      connector
    );
    return { user, datapeps };
  } catch (error) {
    if (error.kind) {
      switch (error.kind) {
        case SDKError.IdentityInvalidKeySet:
          throw new Error("Bad Password");
        default:
      }
    }
    throw error;
  }
}

async function loginNotes(username, password) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/login`,
    requestOptions
  );
  const user = await handleResponse(response);
  return user;
}

export async function logout() {
  store.getState().auth.datapeps &&
    (await store.getState().auth.datapeps.logout());
}

export async function subscribe(username, password) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  };
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/subscribe`,
    requestOptions
  );
  return handleResponse(response);
}

export async function updatePassword(password) {
  const datapeps = store.getState().auth.datapeps;
  await new IdentityAPI(datapeps).renewKeys(datapeps.login, password);
}

// Since datapeps is integrated we change the DataPeps password instead of the application password
// export async function updatePassword(password) {
//   const token = localStorage.getItem("user");
//   const username = parseJWT(token).id;
//   const requestOptions = {
//     method: "POST",
//     headers: authHeader(true),
//     body: JSON.stringify({ username: username, password: password })
//   };
//   const response = await fetch(
//     `${process.env.REACT_APP_API_URL}/auth/update/password`,
//     requestOptions
//   );
//   return handleResponse(response);
// }
