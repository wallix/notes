import React from "react";
import { connect } from "react-redux";
import { noteActions, uiActions, usersActions } from "../actions";
import { NoteLayout } from "./NoteLayout";
import { uiConstants } from "../constants";

class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Title: props.Title,
      Content: props.Content,
      style: "info",
      resourceId: null
    };
  }

  render() {
    const { DeletedAt, ID, deleteNote, SharedWith, group } = this.props;
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
          SharedWith,
          openShareModal: () => {
            this.props.getUserList();
            this.props.openModal(uiConstants.ShareNoteModal, {
              id: this.props.ID,
              resourceId: this.state.resourceId
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
  ...uiActions,
  getUserList: usersActions.getList
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Note);
