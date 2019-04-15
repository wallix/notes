import { uiConstants } from "../constants";
const initialState = {
  modals: [],
  payload: {}
};

export function modals(state = initialState, action) {
  switch (action.type) {
    case uiConstants.OPEN_MODAL:
      return {
        ...state,
        modals: state.modals.concat(action.id),
        payload: action.payload
      };
    case uiConstants.CLOSE_MODAL:
      return {
        ...state,
        modals: state.modals.filter(item => item !== action.id),
        payload: null
      };
    default:
      return state;
  }
}
