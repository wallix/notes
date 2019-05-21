import { notesConstants, uiConstants } from "../constants";
import { notesService } from "../services";
import { groupLogin } from "../services/utils";
import { uiActions } from "./ui";
import { ResourceAPI } from "datapeps-sdk";

function addNote(title, content, sharedIds) {
  return (dispatch, getState) => {
    let note = {
      type: notesConstants.ADD_NOTE,
      title,
      content
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

function postNote(note, sharedWith, groupID) {
  return async dispatch => {
    dispatch(request(note, sharedWith, groupID));

    try {
      const response = await notesService.postNote(note, groupID, sharedWith);
      let share = await Promise.all(
        sharedWith.map(id => notesService.shareNote(response.noteID, id))
      );
      dispatch(success(response.noteID, share));
      dispatch({ ...note, id: response.noteID });
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function request() {
    return { type: notesConstants.POST_REQUEST };
  }
  function success(id, sharedWith) {
    return { type: notesConstants.POST_SUCCESS, id: id, sharedWith };
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

function getSharedWith(id, resourceId) {
  return async (dispatch, getState) => {
    dispatch(request());
    const datapeps = getState().auth.datapeps;
    const group = getState().auth.selectedGroup;
    try {
      const rApi = new ResourceAPI(datapeps);
      const options = group == null ? null : { assume: groupLogin(group.ID) };
      const sharing = await rApi.getSharingGroup(resourceId, options);
      dispatch(
        success(
          sharing.map(s => s.identityID.login).filter(l => l !== datapeps.login)
        )
      );
    } catch (err) {
      dispatch(failure(err));
    }
  };
  function request() {
    return { type: notesConstants.GETSHARING_REQUEST };
  }
  function success(grp) {
    return {
      type: notesConstants.GETSHARING_SUCCESS,
      id,
      sharedWith: grp
    };
  }
  function failure(error) {
    return { type: notesConstants.GETSHARING_FAILURE, error };
  }
}

export const noteActions = {
  addNote,
  deleteNote,
  getNotes,
  getSharedWith
};
