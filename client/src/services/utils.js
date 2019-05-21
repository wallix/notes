import store from "../store";

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
