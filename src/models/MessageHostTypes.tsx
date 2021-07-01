import Peer from "peerjs";

import { GameSettings } from "./GameSettingsType";
import { GameStatus } from "./GameStatus";
import { PlayerState } from "./PlayerState";

// Definitions for messages from the host to the client
export enum HostTypeConstants {
  UPDATE_ROUND,
  CONNECTION_ACCEPTED,
  UPDATE_PLAYERS_LIST,
  PLAYER_NAME_TAKEN,
  APP_VERSION_MISMATCH,
  UPDATE_FROM_CLICK,
  UPDATE_SETTINGS,
}

export type HostTypes =
  | {
      type: HostTypeConstants.UPDATE_ROUND;
      round: number;
      targetHeroes: number[];
      currentHeroes: number[][];
      statusText: string;
      gameStatus: GameStatus;
    }
  | {
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
    }
  | {
      type: HostTypeConstants.UPDATE_PLAYERS_LIST;
      players: Record<string, PlayerState>;
    }
  | {
      type: HostTypeConstants.PLAYER_NAME_TAKEN;
      currentPlayers: string[];
    }
  | {
      type: HostTypeConstants.APP_VERSION_MISMATCH;
      hostVersion: string;
      clientVersion: string;
    }
  | {
      type: HostTypeConstants.UPDATE_FROM_CLICK;
      isCorrectHero: boolean;
      lastClickedPlayerName: string;
      players: Record<string, PlayerState>;
      // Will prefer to send sets as those are our native data structure,
      // but Peer JS does not seem to like sets.
      // Maybe revisit in the future to see if they make an update to support sets.
      selected: number[];
      invalidIcons: number[];
      statusText: string;
      gameStatus: GameStatus;
    }
  | {
      type: HostTypeConstants.UPDATE_SETTINGS;
      settings: GameSettings;
    };

export interface ClientDataConnection extends Peer.DataConnection {
  send(data: HostTypes): void;
}
