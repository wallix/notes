import React from "react";
import { Router, Route } from "react-router-dom";
import { connect } from "react-redux";

import { uiActions } from "../actions";
import { history } from "../history";

// Components
import LoginPage from "./LoginPage";
import { PrivateRoute } from "./PrivateRoute";
import MainPage from "./MainPage";

class App extends React.Component {
  constructor(props) {
    super(props);

    const { dispatch } = this.props;
    history.listen((location, action) => {
      // clear alert on location change
      dispatch(uiActions.clear());
    });
  }

  render() {
    const { alert } = this.props;
    return (
      <div>
        {alert.message && (
          <div className={`alert ${alert.type}`}>{alert.message}</div>
        )}
        <Router history={history}>
          <div>
            <div>
              <PrivateRoute exact path="/" component={MainPage} />
              <Route path="/login" component={LoginPage} />
            </div>
            <footer className="footer">
              <div
                className="container"
                style={{ display: "flex", alignItems: "center" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  height="18px"
                  width="18px"
                >
                  <g>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.84 9.49.5.09.68-.22.68-.485 0-.236-.008-.866-.013-1.7-2.782.603-3.37-1.34-3.37-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.07-.607.07-.607 1.004.07 1.532 1.03 1.532 1.03.89 1.53 2.34 1.09 2.91.833.09-.647.348-1.086.634-1.337-2.22-.252-4.555-1.112-4.555-4.944 0-1.09.39-1.984 1.03-2.682-.104-.254-.448-1.27.096-2.646 0 0 .84-.27 2.75 1.025.8-.223 1.654-.333 2.504-.337.85.004 1.705.114 2.504.336 1.91-1.294 2.748-1.025 2.748-1.025.546 1.376.202 2.394.1 2.646.64.7 1.026 1.59 1.026 2.682 0 3.84-2.337 4.687-4.565 4.935.36.307.68.917.68 1.852 0 1.335-.013 2.415-.013 2.74 0 .27.18.58.688.482C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                  </g>
                </svg>
                <span>
                  &nbsp;
                  <a href="https://github.com/wallix/notes">wallix/notes</a>
                </span>
              </div>
            </footer>
          </div>
        </Router>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { alert } = state;
  return {
    alert
  };
}

export default connect(mapStateToProps)(App);
