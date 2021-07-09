import React from "react";

import GamePage from "components/GameShared/GamePage";
import LobbyView from "components/GameShared/LobbyView";
import { useAppSelector } from "hooks/useStore";
import { selectPlayerName } from "store/application/applicationSlice";
import { selectRound } from "store/game/gameSlice";

function GameHostPage(): JSX.Element {
  const playerName = useAppSelector(selectPlayerName);
  const round = useAppSelector(selectRound);

  // Waits for the playerName to be read before rendering
  if (playerName === undefined) {
    return <></>;
  }

  // Game lobby
  if (round === 0) {
    return <LobbyView />;
  }

  // Actual game
  return <GamePage />;
}

export default GameHostPage;
