import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import AboutPage from "components/AboutPage";
import GameClientPage from "components/GameClient/GameClientPage";
import GameHostPage from "components/GameHost/GameHostPage";
import Header from "components/Header";
import HelmetWrapper from "components/HelmetWrapper";
import HomePage from "components/HomePage";
import { StoreContextProvider } from "reducer/store";

function App(): JSX.Element {
  return (
    <StoreContextProvider>
      <HelmetWrapper />
      <Router>
        <Header />
        <Switch>
          <Route path="/play/:remoteHostID">
            <GameClientPage />
          </Route>
          <Route path="/play">
            <GameHostPage />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </Router>
    </StoreContextProvider>
  );
}

export default App;
