import localForage from "localforage";

import { GameSettings } from "models/GameSettingsType";
import { RegularModals } from "models/Modals";
import { PlayerState } from "models/PlayerState";
import {
  selectPlayerName,
  updateModalToShow,
} from "store/application/applicationSlice";
import { AppThunk } from "store/rootStore";
import { StorageConstants } from "utils/constants";

import {
  startHostWS,
  stopHostWS,
  submitPlayerNameAction,
  modifyGameSettingsAction,
} from "./hostActions";

export const startHosting = (): AppThunk => (dispatch, getState) => {
  const playerName = selectPlayerName(getState());
  if (playerName === "") {
    dispatch(updateModalToShow({ modal: RegularModals.PLAYER_NAME_MODAL }));
  } else {
    dispatch(startHostWS(playerName));
  }
};

export const stopHosting = (): AppThunk => (dispatch) => {
  dispatch(stopHostWS());
};

export const submitPlayerName =
  (submittedPlayerName: string): AppThunk =>
  (dispatch, getState) => {
    // Save new player name locally
    localForage.setItem(StorageConstants.PLAYER_NAME, submittedPlayerName);
    // Close modal asking for player name input
    dispatch(updateModalToShow({ modal: null }));

    const playerName = selectPlayerName(getState());
    const players = { ...getState().game.players };

    const currentPlayers: Record<string, PlayerState> = {};

    // Omits old name in the new player list, adds new name
    for (const [storePlayerName, storePlayer] of Object.entries(players)) {
      if (storePlayerName !== playerName) {
        currentPlayers[storePlayerName] = storePlayer;
      } else {
        currentPlayers[submittedPlayerName] = storePlayer;
      }
    }

    dispatch(
      submitPlayerNameAction({
        playerName: submittedPlayerName,
        players: currentPlayers,
      })
    );
  };

export const modifyGameSettings =
  (gameSettings: GameSettings): AppThunk =>
  (dispatch) => {
    dispatch(modifyGameSettingsAction(gameSettings));
  };
