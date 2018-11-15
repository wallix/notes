import React from "react";
import { connect } from "react-redux";
import { Button, Navbar, Nav, NavDropdown, MenuItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { parseJWT } from "../utils";
import { uiConstants } from "../constants";
import { uiActions } from "../actions";
import NewNote from "./NewNote";
import UserProfile from "./UserProfile";

class Navigation extends React.Component {
  render() {
    const { user } = this.props;
    // this should not fail...
    const username = user ? parseJWT(user.token).id : "User";
    return (
      <div>
        <NewNote />
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
                onClick={() =>
                  this.props.dispatch(
                    uiActions.openModal(uiConstants.NewNoteModal)
                  )
                }
              >
                New Note
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
                <LinkContainer to="/login">
                  <MenuItem eventKey={2.2}>Logout</MenuItem>
                </LinkContainer>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { notes, authentication } = state;
  const { user } = authentication;
  return {
    user,
    notes
  };
}

export default connect(mapStateToProps)(Navigation);
