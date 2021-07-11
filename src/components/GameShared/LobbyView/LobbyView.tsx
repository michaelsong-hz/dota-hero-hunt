import React, { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { clientDisconnect } from "store/client/clientSlice";
import { endGame } from "store/game/gameHostThunks";
import { isSinglePlayer } from "store/host/hostSlice";
import { appendTheme, isClient } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import LobbyInvite from "../LobbyInvite";
import GameSettings from "../Settings";

function LobbyView(): JSX.Element {
  const isSingleP = useAppSelector(isSinglePlayer);
  const isDark = useAppSelector(selectIsDark);

  const dispatch = useAppDispatch();

  const [showPlayersPanel, setShowPlayersPanel] = useState(
    isSingleP ? false : true
  );
  const [playersPanelAnimation, setPlayersPanelAnimation] = useState("");

  useEffect(() => {
    dispatch(endGame());
  }, [dispatch]);

  useEffect(() => {
    if (isSingleP === false && showPlayersPanel === false) {
      setShowPlayersPanel(true);
      setPlayersPanelAnimation("lobby-view-player-in");
    } else if (!isClient() && isSingleP === true) {
      setShowPlayersPanel(false);
    }
  }, [isSingleP, showPlayersPanel]);

  return (
    <Container fluid="xl" className="mt-3">
      <PlayerNameModal />

      <div className="d-flex flex-column">
        {isClient() && (
          <Link to="/" className="lobby-view-disconnect">
            <Button
              variant={"danger"}
              onClick={() => dispatch(clientDisconnect())}
            >
              Disconnect
            </Button>
          </Link>
        )}
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
        </div>{" "}
      </div>
    </Container>
  );
}

export default LobbyView;
