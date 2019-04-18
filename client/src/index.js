import React from "react";
import { render } from "react-dom";

// redux + thunk
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";

// main application
import App from "./components/App";
import rootReducer from "./reducers";

import * as DataPeps from "datapeps-sdk";

const loggerMiddleware = createLogger();
const store = createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware, loggerMiddleware)
);

const DATAPEPS_API =
  window._env_.DATAPEPS_API || process.env.REACT_APP_DATAPEPS_API;

if (DATAPEPS_API) {
  DataPeps.configure(DATAPEPS_API);
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
