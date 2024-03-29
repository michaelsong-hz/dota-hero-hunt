import Peer from "peerjs";

// Definitions for messages from the client to the host
export enum ClientTypeConstants {
  PLAYER_ACTION,
}

export type ClientTypes = {
  type: ClientTypeConstants.PLAYER_ACTION;
  selected: number;
};

export interface HostDataConnection extends Peer.DataConnection {
  send(data: ClientTypes): void;
  metadata: {
    playerName: string;
    version: string;
  };
}
