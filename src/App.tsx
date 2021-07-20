import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import AboutPage from "components/AboutPage";
import GameClientPage from "components/GameClient/GameClientPage";
import GameHostPage from "components/GameHost/GameHostPage";
import LobbyView from "components/GameShared/LobbyView";
import Header from "components/Header";
import HelmetWrapper from "components/HelmetWrapper";
import LoadStore from "components/LoadStore";
import SharedModal from "components/Modals/SharedModal";
import NotFoundPage from "components/NotFoundPage";
import UpdateMessage from "components/UpdateMessage";
import { useAppSelector } from "hooks/useStore";
import { selectRemoteHostID } from "store/client/clientSlice";
import { selectHostID } from "store/host/hostSlice";

function App(): JSX.Element {
  const hostID = useAppSelector(selectHostID);
  const remoteHostID = useAppSelector(selectRemoteHostID);

  // Check if the user really wants to leave when hosting or connected to a game
  useEffect(() => {
    window.onbeforeunload = (event) => {
      if (hostID !== null || remoteHostID !== null) {
        const e = event || window.event;
        e.preventDefault();
        if (e) {
          e.returnValue = "";
        }
        return "";
      }
    };
  }, [hostID, remoteHostID]);

  return (
    <>
      <HelmetWrapper />
      <UpdateMessage />
      <Router>
        <SharedModal />
        <Header />
        <LoadStore>
          <Switch>
            <Route path="/play/:remoteHostID">
              <GameClientPage />
            </Route>
            <Route path="/about">
              <AboutPage />
            </Route>
            <Route exact path="/settings">
              <LobbyView />
            </Route>
            <Route exact path="/">
              <GameHostPage />
            </Route>
            <Route component={NotFoundPage}>
              <NotFoundPage />
            </Route>
          </Switch>
        </LoadStore>
      </Router>
    </>
  );
}

export default App;
