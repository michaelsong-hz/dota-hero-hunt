import React from "react";
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom";

import ConnectionPage from "components/ConnectionPage";
import GamePage from "components/GamePage";

function App(): JSX.Element {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Page</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/connect/:remoteHostID">
            <ConnectionPage />
          </Route>
          <Route path="/about">
            <GamePage />
          </Route>
          <Route path="/">
            <GamePage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
