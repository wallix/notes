import React from "react";
import { Alert, Panel, Button, ButtonGroup, Glyphicon } from "react-bootstrap";
import "./NoteLayout.css";

export const NoteLayout = ({
  DeletedAt,
  ID,
  deleteNote,
  Title,
  Content,
  Error,
  style,
  Users,
  openShareModal,
  group
}) => (
  <Panel className="note-item" bsStyle={DeletedAt ? "danger" : style}>
    <Panel.Heading>
      <Panel.Title componentClass="h3">{Title}</Panel.Title>
    </Panel.Heading>
    <Panel.Body>
      {Content}
      {Error && <Alert bsStyle="danger">{Error}</Alert>}
    </Panel.Body>
    <Panel.Footer className="text-right">
      <ButtonGroup>
        {group != null ? null : (
          <Button onClick={openShareModal} data-test="share">
            <Glyphicon
              className={Users && Users.length > 1 ? "shared" : "notshared"}
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
