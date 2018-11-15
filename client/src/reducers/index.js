import { combineReducers } from "redux";

import { authentication } from "./authentication";
import { alert } from "./alert";
import { modals } from "./modals";
import { notes } from "./notes";

export default combineReducers({
  authentication,
  alert,
  modals,
  notes
});
