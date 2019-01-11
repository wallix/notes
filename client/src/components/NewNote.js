import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Form, FormControl } from "react-bootstrap";

import { uiConstants } from "../constants";
import { noteActions, uiActions } from "../actions";

class NewNote extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.changeTitle = this.changeTitle.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.validate = this.validate.bind(this);
    this.onAddNote = this.onAddNote.bind(this);

    this.state = {
      title: "",
      content: ""
    };
  }

  changeTitle(e) {
    this.setState({ title: e.target.value });
  }
  changeContent(e) {
    this.setState({ content: e.target.value });
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
    this.props.addNote(title, content);
  }
}

const mapStateToProps = state => ({
  modals: state.modals.modals
});
const mapDispatchToProps = {
  ...uiActions,
  ...noteActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewNote);
