import { AppThunk } from "store/rootStore";

import { setPlayerNameAction } from "./applicationActions";

export const setPlayerName =
  (playerName: string): AppThunk =>
  (dispatch) => {
    dispatch(setPlayerNameAction(playerName));
  };
