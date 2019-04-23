import React from "react";
import { render } from "react-dom";

// redux + thunk
import { Provider } from "react-redux";
import store from "./store";

// main application
import App from "./components/App";

import * as DataPeps from "datapeps-sdk";

if (process.env.REACT_APP_DATAPEPS_API != null) {
  DataPeps.configure(process.env.REACT_APP_DATAPEPS_API);
}

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
