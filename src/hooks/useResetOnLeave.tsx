// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from "react";

import { useStoreDispatch } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";

interface UseResetOnLeaveProps {
  cleanUpConnections: () => void;
}

export default function useResetOnLeave(props: UseResetOnLeaveProps): void {
  const dispatch = useStoreDispatch();

  const { cleanUpConnections } = props;

  // Reset round and player list if leaving the page
  useEffect(() => {
    return () => {
      console.log("left game page, resetting state");
      cleanUpConnections();
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
  }, [cleanUpConnections, dispatch]);
}
