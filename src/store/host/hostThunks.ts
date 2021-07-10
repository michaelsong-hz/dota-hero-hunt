import localForage from "localforage";

import { HostTypeConstants } from "models/MessageHostTypes";
import { RegularModals } from "models/Modals";
import { PlayerState } from "models/PlayerState";
import {
  selectPlayerName,
  setPlayerName,
  updateModalToShow,
} from "store/application/applicationSlice";
import { updatePlayersList } from "store/game/gameSlice";
import { AppThunk } from "store/rootStore";
import { StorageConstants } from "utils/constants";

import { hostWSBroadcast, setIsGeneratingLink, startHostWS } from "./hostSlice";

export const startHosting = (): AppThunk => (dispatch, getState) => {
  if (selectPlayerName(getState()) === "") {
    dispatch(updateModalToShow({ modal: RegularModals.PLAYER_NAME_MODAL }));
  } else {
    dispatch(startHostWS());
    dispatch(setIsGeneratingLink(true));
  }
};

export const submitPlayerName =
  (submittedPlayerName: string): AppThunk =>
  (dispatch, getState) => {
    const playerName = selectPlayerName(getState());
    const players = { ...getState().game.players };

    // TODO: Determine if this is always needed
    localForage.setItem(StorageConstants.PLAYER_NAME, submittedPlayerName);

    // Close modal asking for player name input
    dispatch(updateModalToShow({ modal: null }));

    const currentPlayers: Record<string, PlayerState> = {};

    // Omits old name in the new player list, adds new name
    for (const [storePlayerName, storePlayer] of Object.entries(players)) {
      if (storePlayerName !== playerName) {
        currentPlayers[storePlayerName] = storePlayer;
      } else {
        currentPlayers[submittedPlayerName] = storePlayer;
      }
    }

    // Add self to players list
    dispatch(
      hostWSBroadcast({
        type: HostTypeConstants.UPDATE_PLAYERS_LIST,
        players: currentPlayers,
      })
    );
    dispatch(
      updatePlayersList({
        players: currentPlayers,
      })
    );
    dispatch(setPlayerName(submittedPlayerName));
  };
