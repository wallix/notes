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
          DeletedAt: null,
          SharedWith: null
        }
      ];
    case notesConstants.DELETE_NOTE:
      return state.map(note =>
        note.ID === action.id
          ? { ...note, DeletedAt: note.DeletedAt ? null : true }
          : note
      );
    case notesConstants.GETALL_SUCCESS:
      return [...action.notes.notes];
    case notesConstants.GETSHARING_SUCCESS:
      return state.map(note =>
        note.ID === action.id
          ? { ...note, SharedWith: action.sharedWith }
          : note
      );
    case authConstants.LOGOUT:
      return [];
    default:
      return state;
  }
};
