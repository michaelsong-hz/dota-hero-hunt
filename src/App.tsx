import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import AboutPage from "components/AboutPage";
import GameClientPage from "components/GameClient/GameClientPage";
import GameHostPage from "components/GameHost/GameHostPage";
import Header from "components/Header";
import HelmetWrapper from "components/HelmetWrapper";
import SharedModal from "components/Modals/SharedModal";
import NotFoundPage from "components/NotFoundPage";
import UpdateMessage from "components/UpdateMessage";
import { useAppDispatch } from "hooks/useStore";
import { startGame } from "store/game/gameHostThunks";

function App(): JSX.Element {
  // TODO: This may not work? Might be above the store context?
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(startGame());
  }, [dispatch]);

  return (
    <>
      <HelmetWrapper />
      <UpdateMessage />
      <Router>
        <SharedModal />
        <Header />
        <Switch>
          <Route path="/play/:remoteHostID">
            <GameClientPage />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route exact path="/">
            <GameHostPage />
          </Route>
          <Route component={NotFoundPage}>
            <NotFoundPage />
          </Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
