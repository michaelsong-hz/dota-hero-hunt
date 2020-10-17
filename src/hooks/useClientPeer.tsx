import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useContext } from "react";

import {
  ClientTypeConstants,
  HostDataConnection,
  ClientTypes,
} from "models/MessageClientTypes";
import { HostTypes } from "models/MessageHostTypes";

interface UseClientPeerProps {
  playerName: string;
  remoteHostID: string;
  onMessageFromHost: (data: HostTypes) => void;
}

// Connects to a host peer
export default function useClientPeer(
  props: UseClientPeerProps
): [() => void, (data: ClientTypes) => void, string | undefined] {
  const [myPeer, setPeer] = useState<Peer>();
  const [hostConnection, setHostConnection] = useState<
    HostDataConnection | undefined
  >();
  const [error, setError] = useState();

  const cleanUp = () => {
    console.log("peerjs cleanup");
    setHostConnection(undefined);
    if (myPeer) {
      myPeer.disconnect();
      myPeer.destroy();
    }
  };

  function connectToHost() {
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
      console.log("connect to host", props.remoteHostID);

      const currentHostConnection: HostDataConnection = peer.connect(
        props.remoteHostID
      );

      currentHostConnection.on("open", () => {
        console.log("connection opened");
        currentHostConnection.send({
          type: ClientTypeConstants.NEW_CONNECTION,
          playerName: props.playerName,
        });
        setHostConnection(currentHostConnection);
      });
      currentHostConnection.on("data", (data: HostTypes) => {
        console.log("received data", data);
        props.onMessageFromHost(data);
      });
      currentHostConnection.on("error", (err: any) => {
        console.log("connection error", err);
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
      setError(error);
      console.log("peer error", error);
      cleanUp();
    });

    setPeer(peer);

    return () => {
      cleanUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  function sendToHost(data: ClientTypes) {
    if (hostConnection) {
      hostConnection.send(data);
    }
  }

  return [connectToHost, sendToHost, error];
}