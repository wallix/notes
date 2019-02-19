import { authConstants, uiConstants } from "../constants";
import { authService } from "../services";
import { uiActions } from "./index";
import { history } from "../history";
import { ApplicationJWT } from "datapeps-sdk";
import { SDKError } from "datapeps-sdk";

function login(username, password) {
  return async dispatch => {
    dispatch(request());

    try {
      const connector = {
        createSession: async (login, password) =>
          await authService.login(login, password),
        getToken: async user => user.token
      };
      const {
        session: datapeps,
        app: user,
        new: firstTime
      } = await ApplicationJWT.createSession(
        process.env.REACT_APP_DATAPEPS_APP_ID,
        username,
        password,
        connector
      );
      dispatch(success(user, datapeps));
      if (firstTime) {
        dispatch(uiActions.openModal(uiConstants.DataPepsUpdate));
        // history.push done after ChangePassword action
      } else {
        history.push("/");
      }
    } catch (error) {
      if (error.kind) {
        // Error come from pepsdk
        switch (error.kind) {
          case SDKError.BadSecret:
            const message = "incorrect Password";
            dispatch(failure(message));
            dispatch(uiActions.error(message));
            break;
          default:
            dispatch(failure(error.message));
            dispatch(uiActions.error(error.message));
            break;
        }
      } else {
        dispatch(failure(error));
        dispatch(uiActions.error(error));
      }
    }
  };

  function request() {
    return { type: authConstants.LOGIN_REQUEST };
  }
  function success(user, datapeps) {
    return { type: authConstants.LOGIN_SUCCESS, user, datapeps };
  }
  function failure(error) {
    return { type: authConstants.LOGIN_FAILURE, error };
  }
}

function logout() {
  authService.logout();
  return { type: authConstants.LOGOUT };
}

function changePassword(p1, p2, modalName, datapeps) {
  return async dispatch => {
    if (p1 === p2) {
      dispatch(request());
      dispatch(uiActions.closeModal(modalName));
      try {
        await datapeps.renewKeys(p1);
        if (modalName === uiConstants.DataPepsUpdate) {
          history.push("/");
        }
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
