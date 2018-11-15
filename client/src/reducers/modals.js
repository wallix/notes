import { uiConstants } from "../constants";
const initialState = {
  modals: []
};

export function modals(state = initialState, action) {
  switch (action.type) {
    case uiConstants.OPEN_MODAL:
      return {
        ...state,
        modals: state.modals.concat(action.id)
      };
    case uiConstants.CLOSE_MODAL:
      return {
        ...state,
        modals: state.modals.filter(item => item !== action.id)
      };
    default:
      return state;
  }
}
