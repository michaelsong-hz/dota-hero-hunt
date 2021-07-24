import React, { useEffect } from "react";

import GamePage from "components/GameShared/GamePage";
import { useAppDispatch, useAppSelector } from "hooks/useStore";
import {
  selectPlayerName,
  selectSettingsLoaded,
} from "store/application/applicationSlice";
import { cancelCountdown } from "store/game/gameSlice";
import { startGame } from "store/host/hostThunks";

function GameHostPage(): JSX.Element {
  const isSettingsLoaded = useAppSelector(selectSettingsLoaded);
  const playerName = useAppSelector(selectPlayerName);

  const dispatch = useAppDispatch();

  // Start the game when visiting the homepage
  useEffect(() => {
    if (isSettingsLoaded) {
      dispatch(startGame());
    }

    return () => {
      dispatch(cancelCountdown());
    };
  }, [dispatch, isSettingsLoaded, playerName]);

  return <GamePage />;
}

export default GameHostPage;
