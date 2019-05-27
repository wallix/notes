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
  return (dispatch, getState) => {
    let del = {
      type: notesConstants.DELETE_NOTE,
      id
    };
    const group = getState().selectedGroup;
    if (group) {
      notesService
        .deleteGroupNote(id, group.ID)
        .then(ok => dispatch(del), error => dispatch(failure(error)));
    } else {
      notesService
        .deleteNote(id)
        .then(ok => dispatch(del), error => dispatch(failure(error)));
    }
  };
  function failure(error) {
    return { type: notesConstants.DEL_FAILURE, error };
  }
}

function postNote(note, users, groupID) {
  return async dispatch => {
    dispatch(request(users, groupID));

    try {
      const response = await notesService.postNote(note, groupID, users);
      note.ID = response.noteID;
      await notesService.shareNote(note, users);
      dispatch(success(note));
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function request(id, users) {
    return { type: notesConstants.POST_REQUEST, id, users };
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

  function getUserNotes(dispatch) {
    notesService.getNotes().then(
      notes =>
        notesService.getSharedNotes().then(
          shared => {
            dispatch(
              success({
                notes: notes.notes.concat(shared.notes),
                source: "both"
              })
            );
          },
          error => {
            dispatch(success({ ...notes, source: "owner" }));
            dispatch(failure(error));
          }
        ),
      error => dispatch(failure(error))
    );
  }

  function getGroupNotes(dispatch, groupID) {
    notesService.getGroupNotes(groupID).then(
      response =>
        dispatch(
          success({
            notes: response.notes,
            source: "group"
          })
        ),
      error => {
        dispatch(success({ notes: [], source: "owner" }));
        dispatch(failure(error));
      }
    );
  }
}

export const noteActions = {
  addNote,
  deleteNote,
  getNotes
};
