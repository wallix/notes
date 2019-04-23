import React from "react";
import { connect } from "react-redux";
import {
  Button,
  Navbar,
  Nav,
  NavDropdown,
  MenuItem,
  Glyphicon
} from "react-bootstrap";

import { parseJWT } from "../utils";
import { uiConstants, authConstants } from "../constants";
import { uiActions, usersActions, noteActions } from "../actions";
import NewNote from "./NewNote";
import ShareNote from "./ShareNote";
import UserProfile from "./UserProfile";

class Navigation extends React.Component {
  render() {
    const { user } = this.props;
    // this should not fail...
    const username = user ? parseJWT(user.token).id : "User";
    return (
      <div>
        <NewNote />
        <ShareNote />
        <UserProfile user={user} modalName={uiConstants.ChangePasswordModal} />
        <Navbar collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="#home">Notes</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullLeft>
              <Button
                onClick={() => {
                  this.props.dispatch(
                    uiActions.openModal(uiConstants.NewNoteModal)
                  );
                  this.props.dispatch(usersActions.getList());
                }}
              >
                New Note
              </Button>
              <Button
                style={{ marginLeft: "15px" }}
                onClick={() => {
                  this.props.dispatch(noteActions.getNotes());
                }}
              >
                <Glyphicon glyph="refresh" />
              </Button>
            </Navbar.Form>
            <Nav pullRight>
              <NavDropdown
                eventKey={2}
                title={username}
                id="basic-nav-dropdown"
              >
                <MenuItem
                  eventKey={2.1}
                  onClick={() =>
                    this.props.dispatch(
                      uiActions.openModal(uiConstants.ChangePasswordModal)
                    )
                  }
                >
                  User profile
                </MenuItem>
                <MenuItem divider />
                <MenuItem
                  eventKey={2.2}
                  onClick={() =>
                    this.props.dispatch({
                      type: authConstants.LOGOUT
                    })
                  }
                >
                  Logout
                </MenuItem>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { notes, auth } = state;
  const { user } = auth;
  return {
    user,
    notes
  };
}

export default connect(mapStateToProps)(Navigation);
