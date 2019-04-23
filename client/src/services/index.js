import { parseJWT } from "../utils";
import store from "../store";

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
  shareNote
};

export const usersService = {
  getUsers
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

async function postNote(note) {
  const requestOptions = {
    method: "POST",
    headers: authHeader(true),
    body: JSON.stringify(note)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/notes`,
    requestOptions
  );
  return handleResponse(response);
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
