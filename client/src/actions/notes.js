import { notesConstants, uiConstants } from "../constants";
import { notesService } from "../services";
import { uiActions } from "./ui";

function addNote(Title, Content, sharedIds) {
  return (dispatch, getState) => {
    let note = {
      type: notesConstants.ADD_NOTE,
      Title,
      Content
    };
    const group = getState().selectedGroup;
    if (group == null) {
      dispatch(postNote(note, sharedIds));
    } else {
      dispatch(postNote(note, sharedIds, group.ID));
    }
    dispatch(uiActions.closeModal(uiConstants.NewNoteModal));
  };
}

function deleteNote(id) {
  return async (dispatch, getState) => {
    let del = {
      type: notesConstants.DELETE_NOTE,
      id
    };
    const group = getState().selectedGroup;
    try {
      if (group) {
        await notesService.deleteGroupNote(id, group.ID);
      } else {
        await notesService.deleteNote(id);
      }
      dispatch(del);
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function failure(error) {
    return { type: notesConstants.DEL_FAILURE, error };
  }
}

function postNote(note, users, groupID) {
  return async dispatch => {
    dispatch(request());

    try {
      const response = await notesService.postNote(note, groupID, users);
      note.ID = response.noteID;
      await notesService.shareNote(note, users);
      const newNote = await notesService.getNote(note.ID, groupID);
      dispatch(success(newNote));
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function request() {
    return { type: notesConstants.POST_REQUEST };
  }
  function success(note) {
    return { type: notesConstants.POST_SUCCESS, note };
  }
  function failure(error) {
    return { type: notesConstants.POST_FAILURE, error };
  }
}

function getNotes(group) {
  return dispatch => {
    dispatch(request());
    if (group == null) {
      getUserNotes(dispatch);
    } else {
      getGroupNotes(dispatch, group.ID);
    }
  };

  function request() {
    return { type: notesConstants.GETALL_REQUEST };
  }
  function success(notes) {
    return { type: notesConstants.GETALL_SUCCESS, notes };
  }
  function failure(error) {
    return { type: notesConstants.GETALL_FAILURE, error };
  }

  async function getUserNotes(dispatch) {
    try {
      let { notes } = await notesService.getNotes();
      dispatch(success({ notes }));
    } catch (error) {
      dispatch(failure(error));
    }
  }

  async function getGroupNotes(dispatch, groupID) {
    try {
      let { notes } = await notesService.getGroupNotes(groupID);
      dispatch(success({ notes }));
    } catch (error) {
      dispatch(failure(error));
    }
  }
}

export const noteActions = {
  addNote,
  deleteNote,
  getNotes
};
