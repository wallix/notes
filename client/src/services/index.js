import store from "../store";
import { getLogin, IdentityAPI } from "datapeps-sdk";

import { authHeader, handleResponse, groupLogin } from "./utils";
import * as authService from "./auth";
import * as notesService from "./notes";
export { authService, notesService };

export const usersService = {
  getUsers,
  getGroups,
  postGroup
};

async function getGroups() {
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

async function postGroup(group) {
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

// Users API functions

async function getUsers(search = "") {
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
