import { notesConstants, authConstants } from "../constants";

export const notes = (state = [], action) => {
  switch (action.type) {
    case notesConstants.ADD_NOTE:
      return [
        ...state,
        {
          ID: action.id,
          Title: action.title,
          Content: action.content,
          DeletedAt: null
        }
      ];
    case notesConstants.DELETE_NOTE:
      return state.map(
        note =>
          note.ID === action.id
            ? { ...note, DeletedAt: note.DeletedAt ? null : true }
            : note
      );
    case notesConstants.GETALL_SUCCESS:
      return state.concat(action.notes.notes);
    case authConstants.LOGOUT:
      return [];
    default:
      return state;
  }
};
