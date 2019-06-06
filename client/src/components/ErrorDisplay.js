import React from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { uiActions } from "../actions";

const ErrorDisplay = ({ alert, dispatch }) => {
  return (
    <Modal
      show={alert.message !== undefined}
      onHide={() => dispatch(uiActions.clear())}
      className={`alert ${alert.type}`}
    >
      <Modal.Body>{alert.message}</Modal.Body>
    </Modal>
  );
};

function mapStateToProps(state) {
  const { alert } = state;
  return {
    alert
  };
}

export default connect(mapStateToProps)(ErrorDisplay);
