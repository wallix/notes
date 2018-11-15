import { authConstants, uiConstants } from "../constants";
import { authService } from "../services";
import { uiActions } from "./index";
import { history } from "../history";
// @DATAPEPS
import { ApplicationAPI } from "datapeps-sdk";
import config from "../config";

function login(username, password) {
  return async dispatch => {
    dispatch(request());

    try {
      // @DATAPEPS without
      // const user = await authService.login(username, password);
      // dispatch(success(user));
      // history.push("/");
      // @DATAPEPS with
      const connector = {
        createSession: async (login, password) =>
          await authService.login(login, password),
        getToken: async user => user.token
      };
      const {
        session: datapeps,
        app: user,
        new: firstTime
      } = await ApplicationAPI.createJWTSession(
        config.dataPepsAppID,
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
      dispatch(failure(error));
      dispatch(uiActions.error(error));
    }
  };

  function request() {
    return { type: authConstants.LOGIN_REQUEST };
  }
  // @DATAPEPS without
  // function success(user) {
  //   return { type: authConstants.LOGIN_SUCCESS, user };
  // }
  // @DATAPEPS with
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
        // @DATAPEPS without
        // await authService.updatePassword(p1);
        // @DATAPEPS with
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
