import React from "react";
import { connect } from "react-redux";
import { noteActions, uiActions, usersActions } from "../actions";
import { ID } from "datapeps-sdk";
import { ResourceAPI } from "datapeps-sdk";
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
    const { DeletedAt, ID, deleteNote, SharedWith } = this.props;
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
          }
        }}
      />
    );
  }

  componentWillMount() {
    this.decryptNote();
  }
  async decryptNote() {
    try {
      const { datapeps } = this.props;
      const { id, data: encryptedTitle } = ID.unclip(this.state.Title);
      const rApi = new ResourceAPI(datapeps);
      const resource = await rApi.get(id);
      const Title = resource.decrypt(encryptedTitle);
      const Content = resource.decrypt(this.state.Content);
      this.setState({
        Title,
        Content,
        style: "warning",
        resourceId: id
      });
      this.props.getSharedWith(this.props.ID, id);
    } catch (err) {
      console.log("decryptNote: ", err);
    }
  }
}

const mapStateToProps = state => ({
  datapeps: state.authentication.datapeps
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
