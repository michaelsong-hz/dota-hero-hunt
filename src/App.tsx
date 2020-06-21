import React from "react";
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom";

import GamePage from "components/Game/GamePage";
import Home from "components/Home";

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
              <Link to="/play/abc123">Start Game</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/play/:sessionId">
            <GamePage />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
