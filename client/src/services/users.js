import { IdentityAPI, getLogin } from "datapeps-sdk";
import { authHeader, handleResponse, groupLogin } from "./utils";
import store from "../store";

export async function getGroups() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/groups`,
    requestOptions
  );
  return handleResponse(response);
}

export async function shareGroup(groupID, sharingList) {
  const datapeps = store.getState().auth.datapeps;
  await new IdentityAPI(datapeps).replaceSharingGroup(
    groupLogin(groupID),
    sharingList.map(u => getLogin(u, process.env.REACT_APP_DATAPEPS_APP_ID))
  );
}

export async function postGroup(group) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(true),
    body: JSON.stringify(group)
  };

  const response = await handleResponse(
    await fetch(`${process.env.REACT_APP_API_URL}/auth/group`, requestOptions)
  );
  let api = new IdentityAPI(store.getState().auth.datapeps);
  await api.create(
    {
      kind: "group",
      login: groupLogin(response.id),
      name: `Demo notes group: ${group.name}`
    },
    {
      sharingGroup: group.users.map(u =>
        getLogin(u, process.env.REACT_APP_DATAPEPS_APP_ID)
      )
    }
  );
  return response;
}

export async function getUsers(search = "") {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  let query = "";
  if (search !== "") {
    query = `?search=${search}`;
  }

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/users${query}`,
    requestOptions
  );
  return handleResponse(response);
}
