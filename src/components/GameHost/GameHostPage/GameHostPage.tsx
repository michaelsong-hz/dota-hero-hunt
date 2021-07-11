import React, { useEffect } from "react";

import GamePage from "components/GameShared/GamePage";
import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { selectSettingsLoaded } from "store/application/applicationSlice";
import { startGame } from "store/game/gameHostThunks";

function GameHostPage(): JSX.Element {
  const isSettingsLoaded = useAppSelector(selectSettingsLoaded);

  const dispatch = useAppDispatch();

  // Start the game when visiting the homepage
  useEffect(() => {
    if (isSettingsLoaded) {
      dispatch(startGame());
    }
  }, [dispatch, isSettingsLoaded]);

  return <GamePage />;
}

export default GameHostPage;
