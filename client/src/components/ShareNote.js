import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Form } from "react-bootstrap";
import ShareSelect from "./ShareSelect";

import { uiConstants } from "../constants";
import { noteActions, uiActions } from "../actions";
import { ResourceAPI } from "datapeps-sdk";

class ShareNote extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.changeSharingGroup = this.changeSharingGroup.bind(this);
    this.onShareNote = this.onShareNote.bind(this);

    this.state = {
      sharingList: []
    };
  }

  changeSharingGroup(list) {
    this.setState({ sharingList: list });
  }

  render() {
    const { modals, payload, closeModal } = this.props;
    let sharingList;
    if (payload && payload.id) {
      sharingList = (
        <>
          <p>Shared with:</p>
          <ul>
            {this.props.notes
              .find(n => n.ID === payload.id)
              .SharedWith.map(u => (
                <li key={u}>{u}</li>
              ))}
          </ul>
        </>
      );
    }

    return (
      <div>
        <Modal
          show={modals.includes(uiConstants.ShareNoteModal)}
          onHide={() => closeModal(uiConstants.ShareNoteModal)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Extends share of note with...</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {sharingList}
            <Form onSubmit={this.onShareNote}>
              <ShareSelect onChange={this.changeSharingGroup} />
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
      </div>
    );
  }

  async onShareNote() {
    const { datapeps, payload } = this.props;
    await new ResourceAPI(datapeps).extendSharingGroup(
      this.props.payload.resourceId,
      this.state.sharingList.map(
        u => `${u}@${process.env.REACT_APP_DATAPEPS_APP_ID}`
      )
    );
    this.props.getSharedWith(payload.id, payload.resourceId);
    this.props.closeModal(uiConstants.ShareNoteModal);
  }
}

const mapStateToProps = state => ({
  modals: state.modals.modals,
  payload: state.modals.payload,
  notes: state.notes,
  datapeps: state.authentication.datapeps
});
const mapDispatchToProps = {
  ...uiActions,
  ...noteActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareNote);
