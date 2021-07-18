import React from "react";
import { Container } from "react-bootstrap";

import ConnectionView from "components/GameClient/ConnectionView";
import GamePage from "components/GameShared/GamePage";
import LobbyView from "components/GameShared/LobbyView";
import { useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { selectRemoteHostID } from "store/client/clientSlice";
import { selectGameStatus } from "store/game/gameSlice";

function GameClientPage(): JSX.Element {
  const remoteHostID = useAppSelector(selectRemoteHostID);
  const gameStatus = useAppSelector(selectGameStatus);

  // Show connection page, have player set their name and
  // check that there are no conflicting names and that
  // we are connected to the game before proceeding
  if (remoteHostID === null) {
    return (
      <Container className="mt-4">
        <ConnectionView />
      </Container>
    );
  }

  // Game lobby
  if (gameStatus === GameStatus.SETTINGS) {
    return <LobbyView />;
  }

  // Actual game
  return <GamePage />;
}

export default GameClientPage;
