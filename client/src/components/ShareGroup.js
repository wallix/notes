import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Form } from "react-bootstrap";
import ShareSelect from "./ShareSelect";

import { uiConstants, groupLogin } from "../constants";
import { uiActions } from "../actions";
import { IdentityAPI } from "datapeps-sdk";

class ShareGroup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.changeSharingGroup = this.changeSharingGroup.bind(this);
    this.onShareGroup = this.onShareGroup.bind(this);

    this.state = {
      sharingList: []
    };
  }

  changeSharingGroup(list) {
    this.setState({ sharingList: list });
  }

  render() {
    const { modals, payload, closeModal } = this.props;
    if (payload == null) {
      return null;
    }
    const { group } = payload;
    if (group == null) {
      return null;
    }
    console.log("ShareGroup", group);
    return (
      <div>
        <Modal
          show={modals.includes(uiConstants.ShareGroupModal)}
          onHide={() => closeModal(uiConstants.ShareGroupModal)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit group "{group.name}"</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.onShareGroup}>
              <ShareSelect onChange={this.changeSharingGroup} />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => closeModal(uiConstants.ShareGroupModal)}>
              Cancel
            </Button>
            <Button
              bsStyle="primary"
              onClick={this.onShareGroup}
              type="submit"
              disabled={this.state.sharingList.length === 0}
              data-test="share-group"
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  async onShareGroup() {
    const {
      datapeps,
      payload: { group }
    } = this.props;
    await new IdentityAPI(datapeps).replaceSharingGroup(
      groupLogin(group.ID),
      this.state.sharingList.map(
        u => `${u}@${process.env.REACT_APP_DATAPEPS_APP_ID}`
      )
    );
    this.props.closeModal(uiConstants.ShareGroupModal);
  }
}

const mapStateToProps = state => ({
  modals: state.modals.modals,
  payload: state.modals.payload,
  datapeps: state.auth.datapeps
});
const mapDispatchToProps = {
  ...uiActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShareGroup);
