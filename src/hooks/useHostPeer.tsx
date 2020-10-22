import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useRef, useCallback } from "react";

import { ClientTypes } from "models/MessageClientTypes";
import { ClientDataConnection, HostTypes } from "models/MessageHostTypes";
import { StoreReducer } from "reducer/storeReducer";
import { getPeerConfig } from "utils/utilities";

interface UseHostPeerProps {
  state: StoreReducer;
  playerName: string;
  onMessage: (data: ClientTypes) => void;
}

// Connects to (multiple) remote clients
export default function useHostPeer(
  props: UseHostPeerProps
): [string | undefined, () => void, (data: HostTypes) => void] {
  const [hostID, setHostID] = useState<string>();

  const myPeer = useRef<Peer>();
  const connectedClients = useRef<ClientDataConnection[]>([]);

  const cleanUp = useCallback(() => {
    console.log("peerjs cleanup");
    connectedClients.current = [];
    if (myPeer.current) {
      console.log("destroying peer");
      myPeer.current.disconnect();
      myPeer.current.destroy();
    }
  }, []);

  function startHosting() {
    const peer = new Peer(getPeerConfig());

    peer.on("open", () => {
      setHostID(peer.id);
    });

    peer.on("connection", (incomingConn) => {
      console.log("receiving connection");

      incomingConn.on("open", () => {
        console.log("opened connection");
        const prevConnectedClients = [...connectedClients.current];
        prevConnectedClients.push(incomingConn);
        connectedClients.current = prevConnectedClients;
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

    myPeer.current = peer;
    return () => {
      cleanUp();
    };
  }

  const sendToClients = useCallback(
    (data: HostTypes) => {
      connectedClients.current.forEach((clientConnection) => {
        clientConnection.send(data as HostTypes);
      });
    },
    [connectedClients]
  );

  return [hostID, startHosting, sendToClients];
}
