import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "AppRoutes";
import Header from "components/Header";
import HelmetWrapper from "components/HelmetWrapper";
import SharedModal from "components/Modals/SharedModal";
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
      <BrowserRouter>
        <SharedModal />
        <Header />
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;
