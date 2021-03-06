import React from "react";
import { connect } from "react-redux";
import { Row, Col, Glyphicon } from "react-bootstrap";

import "./NoteList.css";

import Note from "./Note";
import { uiActions, usersActions } from "../actions";
import { uiConstants } from "../constants";
import NewGroup from "./NewGroup";
import ShareGroup from "./ShareGroup";

const NoteList = ({ notes, selectedGroup, groups, dispatch }) => {
  return (
    <div>
      <NewGroup />
      <ShareGroup />
      <Row className="notes-sidebar">
        <Col sm={3}>
          <ul
            className="nav flex-column"
            id="v-pills-tab"
            role="tablist"
            aria-orientation="vertical"
          >
            <li className={`nav-item ${selectedGroup == null ? "active" : ""}`}>
              <span
                className="nav-link"
                href="#"
                onClick={() => {
                  dispatch(usersActions.selectGroup());
                }}
              >
                My Notes
              </span>
            </li>
          </ul>
          <ul
            className="nav flex-column"
            id="v-pills-tab"
            role="tablist"
            aria-orientation="vertical"
          >
            <li className="nav-item disabled">
              <span className="nav-link" href="#">
                {groups.length} groups
              </span>
            </li>
            {groups.map(group => (
              <li
                key={group.ID}
                className={`nav-item ${
                  selectedGroup != null && selectedGroup.ID === group.ID
                    ? "active"
                    : ""
                }`}
              >
                <span
                  className="nav-link"
                  onClick={() => {
                    dispatch(usersActions.selectGroup(group));
                  }}
                >
                  <span>{group.name}</span>
                  <span
                    style={{ float: "right" }}
                    onClick={() => {
                      dispatch(usersActions.refresh());
                    }}
                  >
                    <Glyphicon
                      data-test="edit-group"
                      onClick={e => {
                        e.stopPropagation();
                        dispatch(
                          uiActions.openModal(uiConstants.ShareGroupModal, {
                            group
                          })
                        );
                      }}
                      glyph="edit"
                    />
                  </span>
                </span>
              </li>
            ))}
            <li className="nav-item">
              <span
                className="nav-link"
                onClick={() => {
                  dispatch(uiActions.openModal(uiConstants.NewGroupModal));
                }}
                data-test="new-group"
              >
                <Glyphicon glyph="plus" />
              </span>
            </li>
          </ul>
        </Col>
        <Col sm={9}>
          <ul className="list-group row">
            {notes.map(note => (
              <li
                key={note.ID}
                className="list-group-item col-xs-6 col-sm-4 col-md-3 border-0"
              >
                <Note {...note} />
              </li>
            ))}
          </ul>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = state => ({
  notes: state.notes,
  groups: state.groups,
  selectedGroup: state.selectedGroup
});

export default connect(mapStateToProps)(NoteList);
