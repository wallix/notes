import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Form } from "react-bootstrap";
import ShareSelect from "./ShareSelect";

import { uiConstants } from "../constants";
import { noteActions, uiActions } from "../actions";
import { notesService } from "../services";

class ShareNote extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.changeSharingGroup = this.changeSharingGroup.bind(this);
    this.onShareNote = this.onShareNote.bind(this);

    this.state = {
      sharingList: [],
      users: []
    };
  }

  changeSharingGroup(list) {
    this.setState({ sharingList: list });
  }

  render() {
    const { modals, closeModal } = this.props;

    let currentSharer = [];
    if (
      this.props.payload &&
      this.props.payload.note &&
      this.props.payload.note.Users
    ) {
      currentSharer = this.props.payload.note.Users.map(u => u.username);
    }

    return (
      <Modal
        show={modals.includes(uiConstants.ShareNoteModal)}
        onHide={() => closeModal(uiConstants.ShareNoteModal)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Extends share of note with...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Shared with:</p>
          <div className="panel">
            {currentSharer.map(login => (
              <span key={login} className="label label-success">
                {login}
              </span>
            ))}
          </div>
          <Form onSubmit={this.onShareNote}>
            <ShareSelect
              // You can only extends share for notes
              // defaultValue={currentSharer.map(user => ({
              //   label: user,
              //   value: user
              // }))}
              onChange={this.changeSharingGroup}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => closeModal(uiConstants.ShareNoteModal)}>
            Cancel
          </Button>
          <Button
            bsStyle="primary"
            onClick={this.onShareNote}
            type="submit"
            disabled={this.state.sharingList.length === 0}
            data-test="share-note"
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  async onShareNote() {
    try {
      const {
        payload: { note }
      } = this.props;
      await notesService.shareNote(note, this.state.sharingList);
      this.props.closeModal(uiConstants.ShareNoteModal);
    } catch (e) {
      console.log(e);
    }
  }
}

const mapStateToProps = state => ({
  modals: state.modals.modals,
  payload: state.modals.payload,
  notes: state.notes
});
const mapDispatchToProps = {
  ...uiActions,
  ...noteActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareNote);
