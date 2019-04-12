import { usersConstants } from "../constants";
import { usersService } from "../services";

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

export const usersActions = {
  getList
};
