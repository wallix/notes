import { usersConstants, uiConstants, alertConstants } from "../constants";
import { usersService } from "../services";
import { uiActions } from "./ui";
import { noteActions } from "./notes";

function getList(search) {
  return async dispatch => {
    dispatch(request());

    try {
      const response = await usersService.getUsers(search);
      dispatch(success(response.users));
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function request() {
    return { type: usersConstants.GETUSERLIST_REQUEST };
  }
  function success(users) {
    return { type: usersConstants.GETUSERLIST_SUCCESS, users };
  }
  function failure(error) {
    return { type: usersConstants.GETUSERLIST_FAILURE, error };
  }
}

function getGroups() {
  return async dispatch => {
    dispatch(request());

    try {
      const response = await usersService.getGroups();
      dispatch(success(response.groups));
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function request() {
    return { type: usersConstants.GETGROUPLIST_REQUEST };
  }
  function success(groups) {
    return { type: usersConstants.GETGROUPLIST_SUCCESS, groups };
  }
  function failure(error) {
    return { type: usersConstants.GETGROUPLIST_FAILURE, error };
  }
}

function addGroup(group) {
  return dispatch => {
    dispatch(postGroup(group));
    dispatch(uiActions.closeModal(uiConstants.NewGroupModal));
  };
}

function postGroup(group) {
  return async dispatch => {
    dispatch(request());

    try {
      const response = await usersService.postGroup(group);
      dispatch(success({ ...group, ID: response.id }));
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function request() {
    return { type: usersConstants.POSTGROUPLIST_REQUEST };
  }
  function success(group) {
    return { type: usersConstants.POSTGROUPLIST_SUCCESS, group };
  }
  function failure(error) {
    return { type: usersConstants.POSTGROUPLIST_FAILURE, error };
  }
}

function selectGroup(group) {
  return async dispatch => {
    try {
      dispatch(success(group));
      dispatch(noteActions.getNotes(group));
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function success(group) {
    return {
      type:
        group == null
          ? usersConstants.SELECT_MY_NOTES
          : usersConstants.SELECT_GROUP_NOTE,
      group
    };
  }
  function failure(error) {
    return { error };
  }
}

function refresh() {
  return async (dispatch, getState) => {
    try {
      const group = getState().selectedGroup;
      dispatch(success(group));
      dispatch(noteActions.getNotes(group));
      dispatch(getGroups());
    } catch (error) {
      dispatch(failure(error));
    }
  };
  function success(group) {
    return {
      type:
        group == null
          ? usersConstants.SELECT_MY_NOTES
          : usersConstants.SELECT_GROUP_NOTE,
      group
    };
  }
  function failure(error) {
    return { type: alertConstants.ERROR, error };
  }
}

export const usersActions = {
  getList,
  getGroups,
  addGroup,
  selectGroup,
  refresh
};
