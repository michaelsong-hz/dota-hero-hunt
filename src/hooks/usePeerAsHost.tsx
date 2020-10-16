import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect } from "react";

import { ClientTypes } from "models/MessageClientTypes";
import { ClientDataConnection, HostTypes } from "models/MessageHostTypes";

interface UsePeerAsHostProps {
  playerName: string;
  onMessage: (data: ClientTypes) => void;
}

// Connects to (multiple) remote clients
// export default function usePeer(addRemoteStream, removeRemoteStream) {
export default function usePeerAsHost(
  props: UsePeerAsHostProps
): [string | undefined, (data: HostTypes) => void] {
  const [myPeer, setPeer] = useState<Peer>();
  const [hostID, setHostID] = useState<string>();
  const [connectedClients, setConnectedClients] = useState<
    ClientDataConnection[]
  >([]);

  const cleanUp = () => {
    if (myPeer) {
      myPeer.disconnect();
      myPeer.destroy();
    }
    // setPeer(null);
    // setHostID(null);
  };

  useEffect(() => {
    let peer: Peer;
    // Connect to a local dev server if in development, and the cloud hosted peer js
    // server if in production. The cloud hosted peer js server rate limits new
    // connections, which is problematic when developing and hot reloading the application.
    if (process.env.NODE_ENV === "development") {
      peer = new Peer({
        host: "localhost",
        port: 9000,
        path: "/play",
      });
    } else {
      peer = new Peer();
    }

    peer.on("open", () => {
      setPeer(peer);
      setHostID(peer.id);
    });

    peer.on("connection", (incomingConn) => {
      console.log("receiving connection");

      incomingConn.on("open", () => {
        console.log("opened connection");
        setConnectedClients((prevConnectedClients) => [
          ...prevConnectedClients,
          incomingConn,
        ]);
      });
      incomingConn.on("data", (data: ClientTypes) => {
        console.log("received data", data);
        props.onMessage(data);
      });
    });

    peer.on("disconnected", () => {
      console.log("Peer disconnected");
      cleanUp();
    });

    peer.on("close", () => {
      console.log("Peer closed remotely");
      cleanUp();
    });

    peer.on("error", (error) => {
      console.log("peer error", error);
      cleanUp();
    });

    setPeer(peer);

    return () => {
      cleanUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sendToClients(data: HostTypes): void {
    connectedClients.forEach((clientConnection) => {
      clientConnection.send(data as HostTypes);
    });
  }

  return [hostID, sendToClients];
}
