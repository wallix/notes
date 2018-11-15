import { notesConstants, uiConstants } from "../constants";
import { notesService } from "../services";
import { uiActions } from "./ui";

function addNote(title, content) {
  return dispatch => {
    let note = {
      type: notesConstants.ADD_NOTE,
      title,
      content
    };
    dispatch(postNote(note));
    dispatch(uiActions.closeModal(uiConstants.NewNoteModal));
  };
}

function deleteNote(id) {
  return dispatch => {
    let del = {
      type: notesConstants.DELETE_NOTE,
      id
    };

    notesService
      .deleteNote(id)
      .then(ok => dispatch(del), error => dispatch(failure(error)));
  };
  function failure(error) {
    return { type: notesConstants.DEL_FAILURE, error };
  }
}

function postNote(note) {
  return async dispatch => {
    dispatch(request());

    try {
      const response = await notesService.postNote(note);
      dispatch(success(response.noteID));
      dispatch({ ...note, id: response.noteID });
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function request() {
    return { type: notesConstants.POST_REQUEST };
  }
  function success(id) {
    return { type: notesConstants.POST_SUCCESS, id: id };
  }
  function failure(error) {
    return { type: notesConstants.POST_FAILURE, error };
  }
}

function getNotes() {
  return dispatch => {
    dispatch(request());

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
}

export const noteActions = {
  addNote,
  deleteNote,
  getNotes
};
