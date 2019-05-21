import store from "../store";
import { getLogin } from "datapeps-sdk";

export async function handleResponse(response) {
  const text = await response.text();
  const data = text && JSON.parse(text);
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }

  return data;
}

// return authorization header with JWT token
export function authHeader(isJSON) {
  let res = isJSON ? { "Content-Type": "application/json" } : {};
  let user = store.getState().auth.user;
  if (user && user.token) {
    return { ...res, Authorization: "Bearer " + user.token };
  } else {
    return res;
  }
}

export function groupLogin(groupID) {
  return getLogin(
    `group-${groupID}-${process.env.REACT_APP_GROUP_SEED}`,
    process.env.REACT_APP_DATAPEPS_APP_ID
  );
}
