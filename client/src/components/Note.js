import React from "react";
import { connect } from "react-redux";
import { noteActions, uiActions } from "../actions";
import { NoteLayout } from "./NoteLayout";
import { uiConstants } from "../constants";

class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Title: props.Title,
      Content: props.Content,
      style: "info"
    };
  }

  render() {
    const { DeletedAt, ID, deleteNote, Users, group } = this.props;
    const { Title, Content, style } = this.state;

    return (
      <NoteLayout
        {...{
          DeletedAt,
          ID,
          deleteNote,
          Title,
          Content,
          style,
          Users,
          openShareModal: () => {
            this.props.openModal(uiConstants.ShareNoteModal, {
              note: this.props
            });
          },
          group
        }}
      />
    );
  }
}

const mapStateToProps = state => ({
  group: state.selectedGroup
});
const mapDispatchToProps = {
  ...noteActions,
  ...uiActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Note);
