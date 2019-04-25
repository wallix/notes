import { combineReducers } from "redux";

import { auth } from "./auth";
import { alert } from "./alert";
import { modals } from "./modals";
import { notes } from "./notes";
import { users, groups, selectedGroup } from "./users";

export default combineReducers({
  auth,
  alert,
  modals,
  notes,
  users,
  groups,
  selectedGroup
});
