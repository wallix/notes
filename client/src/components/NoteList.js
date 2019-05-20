import React from "react";
import { connect } from "react-redux";
import { Row, Col, Glyphicon, Button } from "react-bootstrap";

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
            class="nav flex-column"
            id="v-pills-tab"
            role="tablist"
            aria-orientation="vertical"
          >
            <li class={`nav-item ${selectedGroup == null ? "active" : ""}`}>
              <a
                class="nav-link"
                onClick={() => {
                  dispatch(usersActions.selectGroup());
                }}
              >
                My Notes
              </a>
            </li>
          </ul>
          <ul
            class="nav flex-column"
            id="v-pills-tab"
            role="tablist"
            aria-orientation="vertical"
          >
            <li class="nav-item disabled">
              <a class="nav-link" href="#">
                {groups.length} groups
              </a>
            </li>
            {groups.map(group => (
              <li
                key={group.ID}
                class={`nav-item ${
                  selectedGroup != null && selectedGroup.ID == group.ID
                    ? "active"
                    : ""
                }`}
              >
                <a
                  class="nav-link"
                  onClick={() => {
                    dispatch(usersActions.selectGroup(group));
                  }}
                >
                  <span>{group.name}</span>
                  <span
                    style={{ float: "right" }}
                    onClick={() => {
                      this.props.dispatch(usersActions.refresh());
                    }}
                  >
                    <Glyphicon
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
                </a>
              </li>
            ))}
            <li class="nav-item">
              <a
                class="nav-link"
                onClick={() => {
                  dispatch(uiActions.openModal(uiConstants.NewGroupModal));
                }}
              >
                <Glyphicon glyph="plus" />
              </a>
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
