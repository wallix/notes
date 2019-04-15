import React from "react";
import { storiesOf } from "@storybook/react";
import { NoteLayout } from "../src/components/NoteLayout";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rootReducer from "../src/reducers";

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

storiesOf("Note", module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .add("with text", () => (
    <div className="container">
      <ul className="list-group row">
        <li
          key={0}
          className="list-group-item col-xs-6 col-sm-4 col-md-3 border-0"
        >
          <NoteLayout
            {...{
              ID: 0,
              Title: "A new Note",
              Content: "Content of the note",
              style: "info"
            }}
          />
        </li>
        <li
          key={1}
          className="list-group-item col-xs-6 col-sm-4 col-md-3 border-0"
        >
          <NoteLayout
            {...{
              ID: 1,
              Title: "A new encrypted and shared Note",
              Content: "Content of the encrypted and shared note",
              style: "warning",
              SharedWith: ["toto", "tata"]
            }}
          />
        </li>
      </ul>
    </div>
  ));
