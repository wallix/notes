import { authConstants } from "../constants";

let user = JSON.parse(localStorage.getItem("user"));
// @DATAPEPS
const initialState = user ? { loggedIn: true, user, datapeps: {} } : {};

export function authentication(state = initialState, action) {
  switch (action.type) {
    case authConstants.LOGIN_REQUEST:
      return {
        loggingIn: true
      };
    case authConstants.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        user: action.user,
        datapeps: action.datapeps // @DATAPEPS
      };
    case authConstants.LOGIN_FAILURE:
      return {};
    case authConstants.LOGOUT:
      return {};
    default:
      return state;
  }
}
