import Peer from "peerjs";

import { PlayerState } from "./PlayerState";

// Definitions for messages from the host to the client
export enum HostTypeConstants {
  UPDATE_ROUND = "START_GAME",
  UPDATE_GAME_STATE = "UPDATE_GAME_STATE",
  CONNECTION_ACCEPTED = "CONNECTION_ACCEPTED",
  UPDATE_FROM_CLICK = "UPDATE_FROM_CLICK",
}

export type HostTypes =
  | {
      type: HostTypeConstants.UPDATE_ROUND;
      targetHeroes: number[];
      currentHeroes: number[][];
    }
  // | {
  //     type: HostTypeConstants.UPDATE_ROUND;
  //     round: number;
  //   }
  | {
      type: HostTypeConstants.UPDATE_GAME_STATE;
      connectedPlayers: Array<PlayerState>;
    }
  | {
      type: HostTypeConstants.CONNECTION_ACCEPTED;
    }
  | {
      type: HostTypeConstants.UPDATE_FROM_CLICK;
      lastClickedPlayerName: string;
      players: Array<PlayerState>;
      // Will prefer to send sets as those are our native data structure,
      // but Peer JS does not seem to like sets.
      // Maybe revisit in the future to see if they make an update to support sets.
      selected: Array<number>;
    };

export interface ClientDataConnection extends Peer.DataConnection {
  send(data: HostTypes): void;
}
