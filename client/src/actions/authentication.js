import { authConstants, uiConstants } from "../constants";
import { authService } from "../services";
import { uiActions } from "./index";
import { history } from "../history";

function login(username, password) {
  return async dispatch => {
    dispatch(request());

    try {
      const user = await authService.login(username, password);
      dispatch(success(user));
      history.push("/");
    } catch (error) {
      dispatch(failure(error));
      dispatch(uiActions.error(error));
    }
  };

  function request() {
    return { type: authConstants.LOGIN_REQUEST };
  }
  function success(user) {
    return { type: authConstants.LOGIN_SUCCESS, user };
  }

  function failure(error) {
    return { type: authConstants.LOGIN_FAILURE, error };
  }
}

function logout() {
  authService.logout();
  return { type: authConstants.LOGOUT };
}

function changePassword(p1, p2, modalName) {
  return async dispatch => {
    if (p1 === p2) {
      dispatch(request());
      dispatch(uiActions.closeModal(modalName));
      try {
        await authService.updatePassword(p1);
        dispatch(success());
      } catch (e) {
        dispatch(failure(e));
      }
    }
  };

  function request() {
    return { type: authConstants.CHANGE_REQUEST };
  }
  function success() {
    return { type: authConstants.CHANGE_SUCCESS };
  }
  function failure(error) {
    return { type: authConstants.CHANGE_ERROR, error };
  }
}

function subscribe(username, p1, p2) {
  return dispatch => {
    if (p1 === p2) {
      dispatch(request());
      dispatch(uiActions.closeModal(uiConstants.UserSubscribeModal));
      authService
        .subscribe(username, p1)
        .then(ok => dispatch(success()), error => dispatch(failure(error)));
    }
  };
  function request() {
    return { type: authConstants.SUBSCRIBE_REQUEST };
  }
  function success() {
    return { type: authConstants.SUBSCRIBE_SUCCESS };
  }
  function failure(error) {
    return { type: authConstants.SUBSCRIBE_ERROR, error };
  }
}

export const authActions = {
  login,
  logout,
  changePassword,
  subscribe
};
