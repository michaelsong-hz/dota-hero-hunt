import Peer from "peerjs";

import { GameSettings } from "./GameSettingsType";
import { PlayerState } from "./PlayerState";

// Definitions for messages from the host to the client
export enum HostTypeConstants {
  UPDATE_ROUND = "UPDATE_ROUND",
  CONNECTION_ACCEPTED = "CONNECTION_ACCEPTED",
  PLAYER_NAME_TAKEN = "PLAYER_NAME_TAKEN",
  UPDATE_FROM_CLICK = "UPDATE_FROM_CLICK",
  UPDATE_SETTINGS = "UPDATE_SETTINGS",
}

export type HostTypes =
  | {
      type: HostTypeConstants.UPDATE_ROUND;
      round: number;
      targetHeroes: number[];
      currentHeroes: number[][];
    }
  | {
      type: HostTypeConstants.CONNECTION_ACCEPTED;
      players: Record<string, PlayerState>;
      settings: GameSettings;
    }
  | {
      type: HostTypeConstants.PLAYER_NAME_TAKEN;
      currentPlayers: string[];
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
    }
  | {
      type: HostTypeConstants.UPDATE_SETTINGS;
      settings: GameSettings;
    };

export interface ClientDataConnection extends Peer.DataConnection {
  send(data: HostTypes): void;
}
