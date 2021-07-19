import { createAction } from "@reduxjs/toolkit";

import { GameSettings } from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { ClientTypes } from "models/MessageClientTypes";
import { HostTypeConstants } from "models/MessageHostTypes";
import { PlayerState } from "models/PlayerState";

import {
  CLIENT_PEER_CONNECTED,
  CLIENT_PEER_SEND,
  CLIENT_PEER_START,
  CLIENT_PEER_STOP,
} from "./clientConstants";

export const clientPeerStartAction = createAction(CLIENT_PEER_START);
export const clientPeerStopAction = createAction(CLIENT_PEER_STOP);
export const clientPeerSendAction = createAction<ClientTypes>(CLIENT_PEER_SEND);

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
