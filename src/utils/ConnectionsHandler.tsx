import Peer from "peerjs";

import {
  HostDataConnection,
  ClientTypes,
  ClientTypeConstants,
} from "models/MessageClientTypes";
import { ClientDataConnection, HostTypes } from "models/MessageHostTypes";

export default class ConnectionsHandler {
  peer: Peer;
  remoteHostID?: string;
  hostConnection: HostDataConnection | undefined;
  connectedClients: ClientDataConnection[];

  // TODO: Investigate if all these need to be stored in the class
  onClientConnection: (incomingConn: ClientDataConnection) => void;
  // onClientMessage: (
  //   data: ClientTypes,
  //   connectedClients: ClientDataConnection[]
  // ) => void;
  onHostMessage: (data: HostTypes) => void;

  constructor(
    peer: Peer,
    remoteHostID: string,
    playerName: string,
    onClientConnection: (incomingConn: ClientDataConnection) => void,
    onClientMessage: (
      data: ClientTypes,
      connectedClients: ClientDataConnection[]
    ) => void,
    onHostMessage: (data: HostTypes) => void,
    onSetHostID: (hostID: string) => void
  ) {
    this.peer = peer;

    this.hostConnection = undefined;
    this.connectedClients = [];

    this.onClientConnection = onClientConnection;
    // this.onClientMessage = onClientMessage;
    this.onHostMessage = onHostMessage;

    peer.on("open", () => {
      if (remoteHostID) {
        this.connect(remoteHostID, playerName);
      } else {
        console.log("listening for connections on", peer.id);
        onSetHostID(peer.id);

        peer.on("connection", (incomingConn: ClientDataConnection) => {
          incomingConn.on("open", () => {
            this.onClientConnection(incomingConn);
            this.connectedClients.push(incomingConn);
          });
          incomingConn.on("data", (data: ClientTypes) => {
            console.log(data);
            // TODO: Error handling, checking received data
            onClientMessage(data, this.connectedClients);
          });

          incomingConn.on("error", (err) => {
            console.log("peer connection error", err);
          });
        });
      }
    });
  }

  broadcastToClients(data: HostTypes): void {
    console.log("sending broadcast to clients", this.connectedClients);
    this.connectedClients.forEach((clientConnection) => {
      clientConnection.send(data);
    });
  }

  connect(hostId: string, playerName: string): void {
    this.remoteHostID = hostId;

    console.log("connecting to host", hostId);
    const currentHostConnection: HostDataConnection = this.peer.connect(hostId);

    currentHostConnection.on("open", () => {
      console.log("sending hello");
      // currentHostConnection.send({
      //   type: "debug",
      //   message: "hi!",
      // });
      currentHostConnection.send({
        type: ClientTypeConstants.NEW_CONNECTION,
        playerName: playerName,
      });
      this.hostConnection = currentHostConnection;
    });
    currentHostConnection.on("data", (data: HostTypes) => {
      console.log(data);
      // TODO: Error handling, checking received data
      this.onHostMessage(data);
    });
    currentHostConnection.on("error", (err: any) => {
      console.log("connection error", err);
    });
  }

  destroy(): void {
    this.peer.destroy();
  }
}
