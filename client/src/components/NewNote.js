import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Form, FormControl, Checkbox } from "react-bootstrap";
import { ID } from "datapeps-sdk";
import { ResourceAPI } from "datapeps-sdk";
import ShareSelect from "./ShareSelect";

import { uiConstants } from "../constants";
import { noteActions, uiActions } from "../actions";

class NewNote extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.changeTitle = this.changeTitle.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.changeProtection = this.changeProtection.bind(this);
    this.changeSharingGroup = this.changeSharingGroup.bind(this);
    this.validate = this.validate.bind(this);
    this.onAddNote = this.onAddNote.bind(this);

    this.state = {
      title: "",
      content: "",
      protected: true,
      sharingList: []
    };
  }

  changeTitle(e) {
    this.setState({ title: e.target.value });
  }
  changeContent(e) {
    this.setState({ content: e.target.value });
  }
  changeProtection(e) {
    this.setState({ protected: e.target.checked });
  }
  changeSharingGroup(list) {
    this.setState({ sharingList: list });
  }
  validate() {
    return this.state.title !== "";
  }

  render() {
    const { modals, closeModal } = this.props;
    return (
      <div>
        <Modal
          show={modals.includes(uiConstants.NewNoteModal)}
          onHide={() => closeModal(uiConstants.NewNoteModal)}
        >
          <Modal.Header closeButton>
            <Modal.Title>New Note</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.onAddNote}>
              <FormControl
                type="text"
                name="title"
                placeholder="Title"
                onChange={this.changeTitle}
              />
              <FormControl
                componentClass="textarea"
                placeholder="Content"
                type="text"
                name="content"
                onChange={this.changeContent}
              />
              <Checkbox
                data-test="protected"
                checked={this.state.protected}
                onChange={this.changeProtection}
              >
                Protected
              </Checkbox>
              <ShareSelect onChange={this.changeSharingGroup} />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => closeModal(uiConstants.NewNoteModal)}>
              Cancel
            </Button>
            <Button
              bsStyle="primary"
              onClick={this.onAddNote}
              type="submit"
              disabled={!this.validate()}
              data-test="save"
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  async onAddNote() {
    let title = this.state.title;
    let content = this.state.content;
    if (this.state.protected) {
      const { datapeps } = this.props;
      const resource = await new ResourceAPI(datapeps).create(
        "note",
        {
          description: title,
          URI: `${process.env.REACT_APP_API_URL}/auth/notes`,
          MIMEType: "text/plain"
        },
        [
          datapeps.login,
          ...this.state.sharingList.map(
            u => `${u}@${process.env.REACT_APP_DATAPEPS_APP_ID}`
          )
        ]
      );
      title = resource.encrypt(title);
      title = ID.clip(resource.id, title);
      content = resource.encrypt(content);
    }
    this.props.addNote(title, content, this.state.sharingList);
  }
}

const mapStateToProps = state => ({
  modals: state.modals.modals,
  datapeps: state.auth.datapeps
});
const mapDispatchToProps = {
  ...uiActions,
  ...noteActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewNote);
