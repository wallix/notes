import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Form, FormControl } from "react-bootstrap";

import { parseJWT } from "../utils";
import { uiConstants } from "../constants";
import { authActions, uiActions } from "../actions";

class UserProfile extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.changeUsername = this.changeUsername.bind(this);
    this.changePassword1 = this.changePassword1.bind(this);
    this.changePassword2 = this.changePassword2.bind(this);
    this.check = this.check.bind(this);

    this.state = {
      username:
        props.modalName === uiConstants.UserSubscribeModal ? "" : "user",
      password1: "",
      password2: ""
    };
  }

  changeUsername(e) {
    this.setState({ username: e.target.value });
  }
  changePassword1(e) {
    this.setState({ password1: e.target.value });
  }
  changePassword2(e) {
    this.setState({ password2: e.target.value });
  }
  check() {
    if (this.state.username === "") {
      return 1;
    }
    if (
      this.state.password1 !== this.state.password2 ||
      this.state.password1.length <= 6
    ) {
      return 2;
    }
    return 0;
  }

  render() {
    const props = this.props;
    const userValue = props.user
      ? { value: parseJWT(props.user.token).id }
      : {};
    return (
      <div>
        <Modal
          show={props.modals.includes(props.modalName)}
          onHide={() => props.closeModal(props.modalName)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {props.modalName === uiConstants.ChangePasswordModal
                ? "User Profile"
                : props.modalName === uiConstants.UserSubscribeModal
                ? "Create Account"
                : // @DATAPEPS
                props.modalName === uiConstants.DataPepsUpdate
                ? "Update Your Password"
                : "?"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* @DATAPEPS */}
            {props.modalName === uiConstants.DataPepsUpdate ? (
              <div>
                <p>
                  Notes now uses{" "}
                  <a href="https://en.wikipedia.org/wiki/End-to-end_encryption">
                    end-to-end encryption
                  </a>{" "}
                  with <a href="https://datapeps.com">DataPeps</a> to protect
                  your data!
                </p>
                <p>
                  Please update your password to automatically use encryption
                  for your notes.
                </p>
              </div>
            ) : (
              <div>
                <h4>Username</h4>
                <Form>
                  <FormControl
                    type="text"
                    name="username"
                    disabled={props.user}
                    onChange={this.changeUsername}
                    {...userValue}
                  />
                  <FormControl.Static>
                    {!props.user && this.check() === 1
                      ? "Username can't be empty"
                      : ""}
                  </FormControl.Static>
                </Form>
              </div>
            )}
            <h4>
              {props.modalName === uiConstants.UserSubscribeModal
                ? "Password"
                : "Change Password"}
            </h4>
            <Form>
              <FormControl
                type="password"
                name="password1"
                onChange={this.changePassword1}
                placeholder="Password"
              />
              <FormControl
                type="password"
                name="password2"
                onChange={this.changePassword2}
                placeholder="Repeat Password"
              />
              <FormControl.Static>
                {this.check() === 2
                  ? "Passwords must match and contain 7 or more characters"
                  : ""}
              </FormControl.Static>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => props.closeModal(props.modalName)}>
              Cancel
            </Button>
            <Button
              bsStyle="primary"
              onClick={() => {
                props.modalName === uiConstants.UserSubscribeModal
                  ? props.subscribe(
                      this.state.username,
                      this.state.password1,
                      this.state.password2
                    )
                  : props.changePassword(
                      this.state.password1,
                      this.state.password2,
                      props.modalName,
                      props.datapeps // @DATAPEPS
                    );
              }}
              disabled={this.check() !== 0}
              type="submit"
            >
              {props.modalName === uiConstants.UserSubscribeModal
                ? "Create"
                : "Update"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  modals: state.modals.modals,
  datapeps: state.authentication.datapeps // @DATAPEPS
});
const mapDispatchToProps = {
  ...uiActions,
  ...authActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserProfile);
