import { authConstants, uiConstants } from "../constants";
import { authService } from "../services";
import { uiActions } from "./index";

function login(username, password) {
  return async dispatch => {
    dispatch(request());
    try {
      dispatch(success(await authService.login(username, password)));
    } catch (error) {
      dispatch(failure(error));
      dispatch(uiActions.error(error.message));
    }
  };

  function request() {
    return { type: authConstants.LOGIN_REQUEST };
  }
  function success({ user, datapeps }) {
    return { type: authConstants.LOGIN_SUCCESS, user, datapeps };
  }
  function failure(error) {
    return { type: authConstants.LOGIN_FAILURE, error };
  }
}

function logout() {
  return async dispatch => {
    await authService.logout();
    return dispatch({ type: authConstants.LOGOUT });
  };
}

function changePassword(p1, p2, modalName) {
  return async dispatch => {
    if (p1 === p2) {
      dispatch(request());
      try {
        await authService.updatePassword(p1);
        dispatch(success());
      } catch (e) {
        dispatch(failure(e));
      }
      dispatch(uiActions.closeModal(modalName));
    }
  };

  function request() {
    return { type: authConstants.CHANGE_REQUEST };
  }
  function success() {
    return { type: authConstants.CHANGE_SUCCESS };
  }
  function failure(error) {
    return { type: authConstants.CHANGE_FAILURE, error };
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
    return { type: authConstants.SUBSCRIBE_FAILURE, error };
  }
}

export const authActions = {
  login,
  logout,
  changePassword,
  subscribe
};
