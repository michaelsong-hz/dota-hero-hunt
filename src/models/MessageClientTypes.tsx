import Peer from "peerjs";

// Definitions for messages from the client to the host
export enum ClientTypeConstants {
  NEW_CONNECTION,
  PLAYER_ACTION,
}

export type ClientTypes =
  | {
      type: ClientTypeConstants.NEW_CONNECTION;
    }
  | {
      type: ClientTypeConstants.PLAYER_ACTION;
      selected: number;
    };

export interface HostDataConnection extends Peer.DataConnection {
  send(data: ClientTypes): void;
}
