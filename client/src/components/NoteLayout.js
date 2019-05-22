import React from "react";
import { Panel, Button, ButtonGroup, Glyphicon } from "react-bootstrap";
import "./NoteLayout.css";

export const NoteLayout = ({
  DeletedAt,
  ID,
  deleteNote,
  Title,
  Content,
  style,
  SharedWith,
  openShareModal,
  group
}) => (
  <Panel className="note-item" bsStyle={DeletedAt ? "danger" : style}>
    <Panel.Heading>
      <Panel.Title componentClass="h3">{Title}</Panel.Title>
    </Panel.Heading>
    <Panel.Body>{Content}</Panel.Body>
    <Panel.Footer className="text-right">
      <ButtonGroup>
        {group != null ? null : (
          <Button onClick={openShareModal} data-test="share">
            <Glyphicon
              className={
                SharedWith && SharedWith.length > 0 ? "shared" : "notshared"
              }
              glyph="share"
            />
          </Button>
        )}
        {DeletedAt || (
          <Button bsStyle={style} onClick={() => deleteNote(ID)}>
            <Glyphicon glyph="trash" />
          </Button>
        )}
      </ButtonGroup>
    </Panel.Footer>
  </Panel>
);
