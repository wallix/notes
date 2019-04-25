import { usersConstants } from "../constants";

export const users = (state = [], action) => {
  switch (action.type) {
    case usersConstants.GETUSERLIST_SUCCESS:
      return [...action.users];
    default:
      return state;
  }
};

export const groups = (state = [], action) => {
  switch (action.type) {
    case usersConstants.GETGROUPLIST_SUCCESS:
      return [...action.groups];
    case usersConstants.POSTGROUPLIST_SUCCESS:
      console.log("Getting group success", action);
      return [action.group].concat(state);
    default:
      return state;
  }
};

export const selectedGroup = (state = null, action) => {
  switch (action.type) {
    case usersConstants.SELECT_GROUP_NOTE:
      return action.group;
    case usersConstants.SELECT_MY_NOTES:
      return null;
    default:
      return state;
  }
};
