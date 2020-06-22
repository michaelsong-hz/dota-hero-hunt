import Peer from "peerjs";

export default class ConnectionsHandler {
  peer: Peer;
  remoteHostID?: string;
  hostConnection: Peer.DataConnection | undefined;
  connectedClients: Peer.DataConnection[];

  onClientMessage: (data: any, connectedClients: Peer.DataConnection[]) => void;
  onHostMessage: (data: any) => void;

  constructor(
    peer: Peer,
    onClientMessage: (
      data: any,
      connectedClients: Peer.DataConnection[]
    ) => void,
    onHostMessage: (data: any) => void,
    onSetHostID: (hostID: string) => void
  ) {
    this.peer = peer;

    this.hostConnection = undefined;
    this.connectedClients = [];

    this.onClientMessage = onClientMessage;
    this.onHostMessage = onHostMessage;

    peer.on("open", () => {
      onSetHostID(peer.id);
      peer.on("connection", (incomingConn) => {
        incomingConn.on("open", () => {
          incomingConn.send({
            type: "debug",
            message: "hello",
          });
          this.connectedClients.push(incomingConn);
        });
        incomingConn.on("data", (data) => {
          console.log(data);
          if (data.type === "playeraction") {
            // TODO: Error handling, checking received data
            onClientMessage(data, this.connectedClients);
          }
        });

        incomingConn.on("error", (err) => {
          console.log("peer connection error", err);
        });
      });
    });
  }

  connect(hostId: string, playerName: string): void {
    this.remoteHostID = hostId;

    console.log("connecting to host", hostId);
    const currentHostConnection = this.peer.connect(hostId);

    currentHostConnection.on("open", () => {
      console.log("sending hello");
      currentHostConnection.send({
        type: "debug",
        message: "hi!",
      });
      currentHostConnection.send({
        type: "connection",
        name: playerName,
      });
      this.hostConnection = currentHostConnection;
    });
    currentHostConnection.on("data", (data: any) => {
      console.log(data);
      if (data.type === "playeraction") {
        // TODO: Error handling, checking received data
        this.onHostMessage(data);
      }
    });
    currentHostConnection.on("error", (err: any) => {
      console.log("connection error", err);
    });
  }
}
