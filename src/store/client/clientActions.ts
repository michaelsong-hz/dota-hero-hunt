import { createAction } from "@reduxjs/toolkit";

import { GameSettings } from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { ClientTypes } from "models/MessageClientTypes";
import { HostTypeConstants } from "models/MessageHostTypes";
import { PlayerState } from "models/PlayerState";
import { SoundEffects } from "utils/SoundEffectList";

import {
  CLIENT_ICON_UPDATE,
  CLIENT_NAME_CHANGE,
  CLIENT_PEER_CONNECTED,
  CLIENT_PEER_SEND,
  CLIENT_PEER_START,
  CLIENT_PEER_STOP,
} from "./clientConstants";

export const clientPeerStartAction = createAction(CLIENT_PEER_START);
export const clientPeerStopAction = createAction<{
  playerName: string;
  nameTaken?: boolean;
}>(CLIENT_PEER_STOP);
export const clientPeerSendAction = createAction<ClientTypes>(CLIENT_PEER_SEND);

export const clientNameChangeAction = createAction<string>(CLIENT_NAME_CHANGE);

export const clientPeerConnectedAction = createAction<{
  type: HostTypeConstants.CONNECTION_ACCEPTED;
  settings: GameSettings;
  players: Record<string, PlayerState>;
  round: number;
  targetHeroes: number[];
  currentHeroes: number[][];
  selected: number[];
  invalidIcons: number[];
  statusText: string;
  gameStatus: GameStatus;
  hostID: string;
}>(CLIENT_PEER_CONNECTED);

export const clientIconUpdateAction = createAction<{
  selectedIcons: number[];
  invalidIcons: number[];
  players: Record<string, PlayerState>;
  statusText: string;
  gameStatus: GameStatus;
  soundEffect: SoundEffects | undefined;
}>(CLIENT_ICON_UPDATE);
