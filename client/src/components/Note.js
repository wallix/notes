import React from "react";
import { connect } from "react-redux";
import { noteActions } from "../actions";
import { ID } from "datapeps-sdk";
import { ResourceAPI } from "datapeps-sdk";
import { NoteLayout } from "./NoteLayout";

class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Title: props.Title,
      Content: props.Content,
      style: "info",
      SharingGroup: []
    };
  }

  render() {
    const { DeletedAt, ID, deleteNote } = this.props;
    const { Title, Content, style } = this.state;
    return (
      <NoteLayout {...{ DeletedAt, ID, deleteNote, Title, Content, style }} />
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
      const sharingGroup = await rApi.getSharingGroup(id);
      const Title = resource.decrypt(encryptedTitle);
      const Content = resource.decrypt(this.state.Content);
      this.setState({
        ...this.state,
        Title,
        Content,
        style: "warning",
        sharingGroup: sharingGroup.map(s => s.identityID.login)
      });
    } catch (err) {
      console.log("decryptNote: ", err);
    }
  }
}

const mapStateToProps = state => ({
  datapeps: state.authentication.datapeps
});
const mapDispatchToProps = {
  ...noteActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Note);
