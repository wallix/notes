import React from "react";
import { connect } from "react-redux";

import { noteActions } from "../actions";
import NoteList from "./NoteList";
import Navigation from "./Navbar";

class MainPage extends React.Component {
  componentDidMount() {
    this.props.dispatch(noteActions.getNotes());
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
  const { notes, auth } = state;
  const { user } = auth;
  return {
    user,
    notes
  };
}

export default connect(mapStateToProps)(MainPage);
