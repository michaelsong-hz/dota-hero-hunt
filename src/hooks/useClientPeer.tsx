import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useCallback, useState, useRef } from "react";

import {
  ClientTypeConstants,
  HostDataConnection,
  ClientTypes,
} from "models/MessageClientTypes";
import { HostTypes } from "models/MessageHostTypes";
import { getPeerConfig } from "utils/utilities";

type UseClientPeerProps = {
  playerName: string;
  remoteHostID: string;
  onMessageFromHost: (data: HostTypes) => void;
};

type UseClientPeerReturn = [
  () => void,
  (data: ClientTypes) => void,
  () => void,
  string | undefined
];

// Connects to a host peer
export default function useClientPeer(
  props: UseClientPeerProps
): UseClientPeerReturn {
  const [hostConnection, setHostConnection] = useState<
    HostDataConnection | undefined
  >();
  const [error, setError] = useState();

  const myPeer = useRef<Peer>();

  const cleanUp = useCallback(() => {
    console.log("peerjs cleanup");
    setHostConnection(undefined);
    if (myPeer.current) {
      console.log("destroying peer");
      myPeer.current.disconnect();
      myPeer.current.destroy();
    }
  }, []);

  function connectToHost() {
    const peer = new Peer(getPeerConfig());

    peer.on("open", () => {
      console.log("connect to host", props.remoteHostID);

      const currentHostConnection: HostDataConnection = peer.connect(
        props.remoteHostID,
        { metadata: { playerName: props.playerName } }
      );

      currentHostConnection.on("open", () => {
        console.log("connection opened");
        currentHostConnection.send({
          type: ClientTypeConstants.NEW_CONNECTION,
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

    myPeer.current = peer;

    return () => {
      cleanUp();
    };
  }

  const sendToHost = useCallback(
    (data: ClientTypes) => {
      if (hostConnection) {
        hostConnection.send(data);
      }
    },
    [hostConnection]
  );

  return [connectToHost, sendToHost, cleanUp, error];
}
