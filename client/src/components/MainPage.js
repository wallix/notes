import React from "react";
import { connect } from "react-redux";

import { noteActions, usersActions } from "../actions";
import NoteList from "./NoteList";
import Navigation from "./Navbar";
import "./NoteList.css";

class MainPage extends React.Component {
  componentDidMount() {
    this.props.dispatch(noteActions.getNotes());
    this.props.dispatch(usersActions.getGroups());
  }

  render() {
    return (
      <div>
        <Navigation />
        <NoteList />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.auth.user,
    notes: state.notes,
    group: state.selectedGroup
  };
}

export default connect(mapStateToProps)(MainPage);
