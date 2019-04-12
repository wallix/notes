import { combineReducers } from "redux";

import { authentication } from "./authentication";
import { alert } from "./alert";
import { modals } from "./modals";
import { notes } from "./notes";
import { users } from "./users";

export default combineReducers({
  authentication,
  alert,
  modals,
  notes,
  users
});
