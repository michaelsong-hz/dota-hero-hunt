import React from "react";

import GamePage from "components/GameShared/GamePage";
import LobbyView from "components/GameShared/LobbyView";
import { useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { selectPlayerName } from "store/application/applicationSlice";
import { selectGameStatus } from "store/game/gameSlice";

function GameHostPage(): JSX.Element {
  const playerName = useAppSelector(selectPlayerName);
  const gameStatus = useAppSelector(selectGameStatus);

  // Waits for the playerName to be read before rendering
  if (playerName === undefined) {
    return <></>;
  }

  // Game lobby
  if (gameStatus === GameStatus.SETTINGS) {
    return <LobbyView />;
  }

  // Actual game
  return <GamePage />;
}

export default GameHostPage;
