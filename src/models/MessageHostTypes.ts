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
  SELECT_ICON,
  COUNTDOWN_TICK,
  UPDATE_SETTINGS,
}

export type HostTypes =
  // Connection negotiation messages
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
      hostID: string;
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

  // Gameplay messages
  | {
      type: HostTypeConstants.UPDATE_ROUND;
      round: number;
      targetHeroes: number[];
      currentHeroes: number[][];
      statusText: string;
      gameStatus: GameStatus;
      players: Record<string, PlayerState>;
    }
  | {
      type: HostTypeConstants.SELECT_ICON;
      isCorrectHero: boolean;
      lastClickedPlayerName: string;
      players: Record<string, PlayerState>;
      selected: number[];
      invalidIcons: number[];
      statusText: string;
      gameStatus: GameStatus;
    }
  | {
      type: HostTypeConstants.COUNTDOWN_TICK;
      countdown: number;
      statusText: string;
      isFirstTick?: boolean;
    }
  | {
      type: HostTypeConstants.UPDATE_SETTINGS;
      settings: GameSettings;
    }
  | {
      type: HostTypeConstants.UPDATE_PLAYERS_LIST;
      players: Record<string, PlayerState>;
    };

export interface ClientDataConnection extends Peer.DataConnection {
  send(data: HostTypes): void;
}
