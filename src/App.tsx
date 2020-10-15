import React from "react";
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom";

import ConnectionPage from "components/ConnectionPage";
import GamePage from "components/GamePage";
import HomePage from "components/HomePage";

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
          <Route path="/play/:remoteHostID">
            <GamePage />
          </Route>
          <Route path="/play">
            <GamePage />
          </Route>
          <Route path="/about">
            <GamePage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
