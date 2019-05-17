import { parseJWT } from "../utils";
import store from "../store";
import { ResourceAPI, ID, getLogin, IdentityAPI } from "datapeps-sdk";
import { groupLogin } from "../constants";

export const authService = {
  login,
  logout,
  updatePassword,
  subscribe
};

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

// login and logout

async function login(username, password) {
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

function logout() {}

// utils

function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from API
        logout();
        window.location.reload(true);
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

// return authorization header with JWT token
function authHeader(isJSON) {
  let res = isJSON ? { "Content-Type": "application/json" } : {};
  let user = store.getState().auth.user;
  if (user && user.token) {
    return { ...res, Authorization: "Bearer " + user.token };
  } else {
    return res;
  }
}

async function subscribe(username, password) {
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

async function updatePassword(password) {
  const token = localStorage.getItem("user");
  const username = parseJWT(token).id;
  const requestOptions = {
    method: "POST",
    headers: authHeader(true),
    body: JSON.stringify({ username: username, password: password })
  };
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/update/password`,
    requestOptions
  );
  return handleResponse(response);
}

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
