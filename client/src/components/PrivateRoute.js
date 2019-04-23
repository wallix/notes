import React from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";

import LoginPage from "./LoginPage";

const PrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      auth.user != null ? <Component {...props} /> : <LoginPage />
    }
  />
);

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);
