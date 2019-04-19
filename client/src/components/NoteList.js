import React from "react";
import { connect } from "react-redux";

import Note from "./Note";

const NoteList = ({ notes }) => {
  return (
    <div className="container">
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
    </div>
  );
};

const mapStateToProps = state => ({
  notes: state.notes
});

export default connect(mapStateToProps)(NoteList);
