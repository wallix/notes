import { usersConstants } from "../constants";

export const users = (state = [], action) => {
  switch (action.type) {
    case usersConstants.GETUSERLIST_SUCCESS:
      return [...action.users];
    default:
      return state;
  }
};
