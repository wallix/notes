import { notesConstants, authConstants } from "../constants";

export const notes = (state = [], action) => {
  switch (action.type) {
    case notesConstants.POST_SUCCESS:
      return [...state, action.note];
    case notesConstants.DELETE_NOTE:
      return state.map(note =>
        note.ID === action.id
          ? { ...note, DeletedAt: note.DeletedAt ? null : true }
          : note
      );
    case notesConstants.GETALL_SUCCESS:
      return [...action.notes.notes];
    case authConstants.LOGOUT:
      return [];
    default:
      return state;
  }
};
