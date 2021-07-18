import { createAction } from "@reduxjs/toolkit";

import { GameSettings } from "models/GameSettingsType";
import { Modals } from "models/Modals";
import { PlayerState } from "models/PlayerState";
import {
  PEER_HOST_START,
  PEER_HOST_STOP,
} from "store/middleware/middlewareConstants";

import {
  HOST_INCREMENT_ROUND,
  HOST_FORCED_DISCONNECT,
  HOST_SELECT_ICON,
  HOST_VISIT_SETTINGS,
  HOST_SUBMIT_PLAYER_NAME,
  HOST_MODIFY_SETTINGS,
} from "./hostConstants";
import {
  prepareAddSelectedIcon,
  prepareIncrementRound,
  prepareVisitSettingsPage,
} from "./hostHelpers";

export const incrementRound = createAction(
  HOST_INCREMENT_ROUND,
  function prepare(overrideRound?: number) {
    return {
      payload: prepareIncrementRound(overrideRound),
    };
  }
);

export const addSelectedIcon = createAction(
  HOST_SELECT_ICON,
  function prepare(selectedIcon: number, selectedPlayerName: string) {
    return {
      payload: prepareAddSelectedIcon(selectedIcon, selectedPlayerName),
    };
  }
);

export const visitSettingsPage = createAction(
  HOST_VISIT_SETTINGS,
  function prepare(isClient: boolean, settings: GameSettings) {
    return {
      payload: {
        players: prepareVisitSettingsPage(isClient),
        isClient,
        settings,
      },
    };
  }
);

export const modifyGameSettingsAction =
  createAction<GameSettings>(HOST_MODIFY_SETTINGS);

export const submitPlayerNameAction = createAction<{
  playerName: string;
  players: Record<string, PlayerState>;
}>(HOST_SUBMIT_PLAYER_NAME);

// Called when the host is forcefully disconnected
// Clean up state and display error modal
export const hostForcefulDisconnect = createAction<{
  modal: Modals;
  message?: string[];
}>(HOST_FORCED_DISCONNECT);

export const startHostWS = createAction<string>(PEER_HOST_START);
export const stopHostWS = createAction(PEER_HOST_STOP);
