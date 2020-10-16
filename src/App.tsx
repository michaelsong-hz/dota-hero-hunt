import React from "react";
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom";

import GamePage from "components/GamePage";
import HomePage from "components/HomePage";
import { GameStatusProvider } from "reducer/GameStatusContext";

function App(): JSX.Element {
  return (
    <GameStatusProvider>
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
    </GameStatusProvider>
  );
}

export default App;
