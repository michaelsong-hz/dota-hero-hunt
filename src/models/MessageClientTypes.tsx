import Peer from "peerjs";

// Definitions for messages from the client to the host
export enum ClientTypeConstants {
  NEW_CONNECTION = "NEW_CONNECTION",
  PLAYER_ACTION = "PLAYER_ACTION",
}

export type ClientTypes =
  | {
      type: ClientTypeConstants.NEW_CONNECTION;
      playerName: string;
    }
  | {
      type: ClientTypeConstants.PLAYER_ACTION;
      playerName: string;
      selected: number;
    };

export interface HostDataConnection extends Peer.DataConnection {
  send(data: ClientTypes): void;
}
