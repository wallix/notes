import React from "react";
import { Panel, Button } from "react-bootstrap";

export const NoteLayout = ({
  DeletedAt,
  ID,
  deleteNote,
  Title,
  Content,
  style,
  sharingWith,
  openShareModal
}) => (
  <Panel className="note-item" bsStyle={DeletedAt ? "danger" : style}>
    {DeletedAt || (
      <Button
        bsStyle={style}
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
    <Panel.Footer className="text-right">
      <Button onClick={openShareModal}>
        <Glyphicon
          className={
            sharingWith && sharingWith.length > 0 ? "shared" : "notshared"
          }
          glyph="share"
        />
      </Button>
    </Panel.Footer>
  </Panel>
);
