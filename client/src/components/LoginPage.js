// Adapted from http://jasonwatmore.com/post/2017/12/07/react-redux-jwt-authentication-tutorial-example

import React from "react";
import { connect } from "react-redux";
import { Button, Jumbotron, Panel } from "react-bootstrap";

import { uiConstants } from "../constants";
import { authActions, uiActions } from "../actions";
import UserProfile from "./UserProfile";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    // reset login status
    this.props.dispatch(authActions.logout());

    this.state = {
      username: "",
      password: "",
      submitted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.setState({ submitted: true });
    const { username, password } = this.state;
    const { dispatch } = this.props;
    if (username && password) {
      dispatch(authActions.login(username, password));
    }
  }

  render() {
    // const { loggingIn } = this.props;
    const { username, password, submitted } = this.state;
    return (
      <div>
        <UserProfile modalName={uiConstants.UserSubscribeModal} />
        <UserProfile modalName={uiConstants.DataPepsUpdate} />
        <Jumbotron>
          <div className="container">
            <h1>Notes</h1>
            <p>
              Notes is simple note-taking application, which serves as a demo
              for <a href="https://datapeps.com">DataPeps</a>. This client is
              implemented with React, while the accompanying REST service is
              built with Go.
            </p>
            <p>
              <Button
                onClick={() =>
                  this.props.dispatch(
                    uiActions.openModal(uiConstants.UserSubscribeModal)
                  )
                }
              >
                Create an account
              </Button>
            </p>
          </div>
        </Jumbotron>
        <div className="container">
          <Panel bsStyle="info">
            <Panel.Heading>
              <Panel.Title componentClass="h3">Login</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <form name="form" onSubmit={this.handleSubmit}>
                <div
                  className={
                    "form-group" + (submitted && !username ? " has-error" : "")
                  }
                >
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={this.handleChange}
                  />
                  {submitted && !username && (
                    <div className="help-block">Username is required</div>
                  )}
                </div>
                <div
                  className={
                    "form-group" + (submitted && !password ? " has-error" : "")
                  }
                >
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={this.handleChange}
                  />
                  {submitted && !password && (
                    <div className="help-block">Password is required</div>
                  )}
                </div>
                <div className="form-group">
                  <button className="btn btn-primary" data-test="login-btn">
                    Login
                  </button>
                </div>
              </form>
            </Panel.Body>
          </Panel>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { loggingIn } = state.auth;
  return {
    loggingIn
  };
}

export default connect(mapStateToProps)(LoginPage);
