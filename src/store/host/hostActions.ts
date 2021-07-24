import { createAction } from "@reduxjs/toolkit";

import { GameSettings } from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { Modals } from "models/Modals";
import { PlayerState } from "models/PlayerState";
import { SoundEffects } from "utils/SoundEffectList";

import {
  HOST_INCREMENT_ROUND,
  HOST_PEER_FORCED_DC,
  HOST_SELECT_ICON,
  HOST_VISIT_LOBBY,
  HOST_SUBMIT_PLAYER_NAME,
  HOST_MODIFY_SETTINGS,
  HOST_PEER_START,
  HOST_PEER_STOP,
  HOST_VISIT_ABOUT,
  HOST_COUNTDOWN_TICK,
} from "./hostConstants";

export const incrementRoundAction = createAction<{
  round: number;
  targetHeroes: number[];
  currentHeroes: number[][];
  statusText: string;
  gameStatus: GameStatus;
  playerName: string;
  players: Record<string, PlayerState>;
}>(HOST_INCREMENT_ROUND);

export const addSelectedIconAction = createAction<
  | {
      isCorrectHero: boolean;
      lastClickedPlayerName: string;
      soundEffect: SoundEffects | undefined;
      nextRoundTimer: NodeJS.Timer | null;
      newState: {
        players: {
          [x: string]: PlayerState;
        };
        selectedIcons: number[];
        invalidIcons: number[];
        statusText: string;
        gameStatus: GameStatus;
      };
    }
  | undefined
>(HOST_SELECT_ICON);

export const hostCountdownAction = createAction<{
  countdown: number;
  statusText: string;
  isFirstTick?: boolean;
}>(HOST_COUNTDOWN_TICK);

export const visitLobbyPageAction =
  createAction<GameSettings>(HOST_VISIT_LOBBY);

export const modifyGameSettingsAction =
  createAction<GameSettings>(HOST_MODIFY_SETTINGS);

export const submitPlayerNameAction = createAction<{
  playerName: string;
  players: Record<string, PlayerState>;
}>(HOST_SUBMIT_PLAYER_NAME);

export const visitAboutPageAction = createAction(HOST_VISIT_ABOUT);

export const hostPeerStartAction = createAction<string>(HOST_PEER_START);
export const hostPeerStopAction = createAction(HOST_PEER_STOP);

// Called when the host is forcefully disconnected
// Clean up state and display error modal
export const hostForcefulDisconnectAction = createAction<{
  modal: Modals;
  message?: string[];
}>(HOST_PEER_FORCED_DC);
