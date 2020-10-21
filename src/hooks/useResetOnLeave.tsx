// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from "react";

import { useStoreDispatch } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";

export default function useResetOnLeave(): void {
  const dispatch = useStoreDispatch();

  // Reset round and player list if leaving the page
  useEffect(() => {
    return () => {
      console.log("left game page, resetting state");
      dispatch({
        type: StoreConstants.UPDATE_ROUND,
        round: 0,
        targetHeroes: new Set(),
        currentHeroes: [],
      });
      dispatch({
        type: StoreConstants.UPDATE_PLAYERS_LIST,
        currentPlayers: {},
      });
    };
  }, [dispatch]);
}
