import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import { useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { isSinglePlayer } from "store/host/hostSlice";
import { appendTheme } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import LobbyInvite from "../LobbyInvite";
import GameSettings from "../Settings";

function LobbyView(): JSX.Element {
  const isSingleP = useAppSelector(isSinglePlayer);
  const isDark = useAppSelector(selectIsDark);

  const [showPlayersPanel, setShowPlayersPanel] = useState(
    isSingleP ? false : true
  );
  const [playersPanelAnimation, setPlayersPanelAnimation] = useState("");

  useEffect(() => {
    if (isSingleP === false && showPlayersPanel === false) {
      setShowPlayersPanel(true);
      setPlayersPanelAnimation("lobby-view-player-in");
    }
  }, [isSingleP, showPlayersPanel]);

  return (
    <Container fluid="xl" className="mt-3">
      <PlayerNameModal />
      <div className="d-flex lobby-view-panels">
        {showPlayersPanel && (
          <div
            className={`${appendTheme(
              "content-holder",
              isDark
            )} ${playersPanelAnimation}`}
          >
            <ConnectedPlayers />
          </div>
        )}
        <div className="d-flex flex-column lobby-view-inner-panels">
          <div>
            <LobbyInvite />
          </div>
          <div>
            <GameSettings />
          </div>
        </div>
      </div>
    </Container>
  );
}

export default LobbyView;
