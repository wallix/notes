import React from "react";
import { Panel, Button } from "react-bootstrap";
import { connect } from "react-redux";

import { noteActions } from "../actions";

class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Title: props.Title,
      Content: props.Content,
      style: "info"
    };
  }

  render() {
    const { DeletedAt, ID, deleteNote } = this.props;
    const { Title, Content } = this.state;
    return (
      <Panel bsStyle={DeletedAt ? "danger" : this.state.style}>
        {DeletedAt || (
          <Button
            bsStyle={this.state.style}
            className="pull-right"
            onClick={() => deleteNote(ID)}
          >
            &times;
          </Button>
        )}
        <Panel.Heading>
          <Panel.Title componentClass="h3">{Title}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>{Content}</Panel.Body>
      </Panel>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  ...noteActions
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Note);
