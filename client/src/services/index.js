import store from "../store";
import { ResourceAPI, ID, getLogin, IdentityAPI } from "datapeps-sdk";

import { groupLogin } from "../constants";
import * as authService from "./auth";
import { authHeader, handleResponse } from "./utils";
export { authService };

export const notesService = {
  getNotes,
  getSharedNotes,
  postNote,
  deleteNote,
  shareNote,
  getGroupNotes
};

export const usersService = {
  getUsers,
  getGroups,
  postGroup
};

// Notes API functions

async function getNotes() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/notes`,
    requestOptions
  );
  return handleResponse(response);
}

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

async function getSharedNotes() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/share/notes`,
    requestOptions
  );
  return handleResponse(response);
}

async function getGroupNotes(groupID) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/group/${groupID}/notes`,
    requestOptions
  );
  return handleResponse(response);
}

async function postNote(note, groupID, sharedWith) {
  await encryptNote(note, groupID, sharedWith);
  const requestOptions = {
    method: "POST",
    headers: authHeader(true),
    body: JSON.stringify(note)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/${
      groupID == null ? "notes" : `group/${groupID}/notes`
    }`,
    requestOptions
  );
  return handleResponse(response);
}

async function encryptNote(note, groupID, sharedWith) {
  let datapeps = store.getState().auth.datapeps;
  let sharingGroup = groupID == null ? [datapeps.login] : [groupLogin(groupID)];
  if (sharedWith != null) {
    sharingGroup = sharingGroup.concat(
      sharedWith.map(u => getLogin(u, process.env.REACT_APP_DATAPEPS_APP_ID))
    );
  }
  const resource = await new ResourceAPI(datapeps).create(
    "note",
    {
      description: note.title,
      URI: `${process.env.REACT_APP_API_URL}/auth/notes`,
      MIMEType: "text/plain"
    },
    sharingGroup
  );
  note.title = resource.encrypt(note.title);
  note.title = ID.clip(resource.id, note.title);
  note.content = resource.encrypt(note.content);
}

async function deleteNote(id) {
  const requestOptions = {
    method: "DELETE",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/notes/${id}`,
    requestOptions
  );
  return handleResponse(response);
}

async function shareNote(id, sharedWith) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/share/${id}/${sharedWith}`,
    requestOptions
  );
  return handleResponse(response);
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
