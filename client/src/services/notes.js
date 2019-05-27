import { ResourceAPI, ID, getLogin } from "datapeps-sdk";

import { handleResponse, authHeader, groupLogin } from "./utils";
import store from "../store";

export async function postNote(note, groupID, users) {
  note = await encryptNote(note, groupID, users);
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

export async function getNotes() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/notes`,
    requestOptions
  );
  return handleNotesResponse(response);
}

export async function getSharedNotes() {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/share/notes`,
    requestOptions
  );
  return handleNotesResponse(response);
}

export async function getUsers(note) {
  const {
    auth: { datapeps },
    selectedGroup: group
  } = store.getState();
  const rApi = new ResourceAPI(datapeps);
  const options = group == null ? null : { assume: groupLogin(group.ID) };
  const sharing = await rApi.getSharingGroup(note.resourceID, options);
  return sharing.map(s => s.identityID.login).filter(l => l !== datapeps.login);
}

export async function getGroupNotes(groupID) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/group/${groupID}/notes`,
    requestOptions
  );
  return handleNotesResponse(response);
}

export async function deleteNote(id) {
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

export async function deleteGroupNote(id, groupId) {
  const requestOptions = {
    method: "DELETE",
    headers: authHeader(false)
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/auth/group/${groupId}/notes/${id}`,
    requestOptions
  );
  return handleResponse(response);
}

export async function shareNote(note, sharingList) {
  if (sharingList == null || sharingList.length === 0) {
    return;
  }
  let datapeps = store.getState().auth.datapeps;
  await new ResourceAPI(datapeps).extendSharingGroup(
    note.resourceID,
    sharingList.map(u => getLogin(u, process.env.REACT_APP_DATAPEPS_APP_ID))
  );
  await sharingList.map(u => {
    const requestOptions = {
      method: "POST",
      headers: authHeader(false)
    };

    return fetch(
      `${process.env.REACT_APP_API_URL}/auth/share/${note.ID}/${u}`,
      requestOptions
    );
  });
}

async function handleNotesResponse(response, groupID) {
  const { notes } = await handleResponse(response);
  console.log("handleNotesResponse", notes);
  return { notes: await Promise.all(notes.map(decryptNote)) };
}

async function encryptNote(note, groupID, users) {
  let datapeps = store.getState().auth.datapeps;
  let sharingGroup = groupID == null ? [datapeps.login] : [groupLogin(groupID)];
  if (users != null) {
    sharingGroup = sharingGroup.concat(
      users.map(u => getLogin(u, process.env.REACT_APP_DATAPEPS_APP_ID))
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
  note.resourceID = resource.id;
  return {
    ...note,
    Title: ID.clip(resource.id, resource.encrypt(note.Title)),
    Content: resource.encrypt(note.Content)
  };
}

async function decryptNote(note) {
  try {
    const {
      auth: { datapeps },
      selectedGroup: group
    } = store.getState();
    const { id, data: encryptedTitle } = ID.unclip(note.Title);
    const api = new ResourceAPI(datapeps);
    const options = group == null ? null : { assume: groupLogin(group.ID) };
    const resource = await api.get(id, options);
    const Title = resource.decrypt(encryptedTitle);
    const Content = resource.decrypt(note.Content);
    return { ...note, Title, Content, resourceID: id };
  } catch (e) {
    return { ...note, Content: e.message };
  }
}
