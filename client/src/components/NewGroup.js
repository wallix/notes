import React from "react";
import { connect } from "react-redux";
import { Modal, Button, Form, FormControl } from "react-bootstrap";
import ShareSelect from "./ShareSelect";

import { uiConstants } from "../constants";
import { uiActions, usersActions } from "../actions";
import { parseJWT } from "../utils";

class NewGroup extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.changeName = this.changeName.bind(this);
    this.changeSharingGroup = this.changeSharingGroup.bind(this);
    this.validate = this.validate.bind(this);
    this.onAddGroup = this.onAddGroup.bind(this);

    this.state = {
      name: "",
      users: []
    };
  }

  changeName(e) {
    this.setState({ name: e.target.value });
  }
  changeSharingGroup(list) {
    this.setState({ users: list });
  }
  validate() {
    return this.state.name !== "";
  }

  render() {
    const { modals, closeModal } = this.props;
    return (
      <div>
        <Modal
          show={modals.includes(uiConstants.NewGroupModal)}
          onHide={() => closeModal(uiConstants.NewGroupModal)}
        >
          <Modal.Header closeButton>
            <Modal.Title>New Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.onAddGroup}>
              <FormControl
                type="text"
                name="name"
                placeholder="Name"
                onChange={this.changeName}
              />
              <ShareSelect onChange={this.changeSharingGroup} />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => closeModal(uiConstants.NewGroupModal)}>
              Cancel
            </Button>
            <Button
              bsStyle="primary"
              onClick={this.onAddGroup}
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

  async onAddGroup() {
    const user = this.props.user;
    const username = user ? parseJWT(user.token).id : "User";
    await this.props.addGroup({
      name: this.state.name,
      users: [username].concat(this.state.users)
    });
  }
}

function mapStateToProps(state) {
  return {
    modals: state.modals.modals,
    user: state.auth.user
  };
}
const mapDispatchToProps = {
  ...uiActions,
  ...usersActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewGroup);
