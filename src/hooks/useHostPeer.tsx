import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useRef, useCallback } from "react";

import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import {
  ClientDataConnection,
  HostTypeConstants,
  HostTypes,
} from "models/MessageHostTypes";
import { StoreReducer } from "reducer/storeReducer";
import { getPeerConfig } from "utils/utilities";

type UseHostPeerProps = {
  playerName: string;
  stateRef: React.MutableRefObject<StoreReducer>;
  onMessage: (data: ClientTypes, fromClient: ClientDataConnection) => void;
};

type UseHostPeerReturn = [
  string | undefined,
  () => void,
  (data: HostTypes) => void,
  () => void
];

// Connects to (multiple) remote clients
export default function useHostPeer(
  props: UseHostPeerProps
): UseHostPeerReturn {
  const [hostID, setHostID] = useState<string>();

  const myPeer = useRef<Peer>();
  const connectedClients = useRef<ClientDataConnection[]>([]);
  // const currentPlayersRef = useRef(props.currentPlayers);

  const cleanUp = useCallback(() => {
    console.log("peerjs cleanup");
    if (myPeer.current) {
      console.log("destroying peer");
      myPeer.current.disconnect();
      myPeer.current.destroy();
    }
    connectedClients.current = [];
  }, []);

  function startHosting() {
    const peer = new Peer(getPeerConfig());

    peer.on("open", () => {
      setHostID(peer.id);
    });

    peer.on("connection", (incomingConn) => {
      console.log("receiving connection");

      incomingConn.on("open", () => {
        // TODO: Move this to data event, only add to list if connection was
        // accepted
        console.log("opened connection from", incomingConn.metadata.playerName);
        const prevConnectedClients = [...connectedClients.current];
        prevConnectedClients.push(incomingConn);
        connectedClients.current = prevConnectedClients;
      });
      incomingConn.on("data", (data: ClientTypes) => {
        console.log("received data", incomingConn.metadata.playerName, data);

        const currentPlayers = props.stateRef.current.players;
        if (
          data.type === ClientTypeConstants.NEW_CONNECTION &&
          incomingConn.metadata.playerName in currentPlayers
        ) {
          // Let client know that the player name has been taken
          const currPlayerNames: string[] = [];

          for (const currPlayerName of Object.keys(currentPlayers)) {
            currPlayerNames.push(currPlayerName);
          }

          incomingConn.send({
            type: HostTypeConstants.PLAYER_NAME_TAKEN,
            currentPlayers: currPlayerNames,
          });
          // TODO: Need to await on previous, then close the connection
          // incomingConn.close();
        } else {
          props.onMessage(data, incomingConn);
        }
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
        clientConnection.send(data);
      });
    },
    [connectedClients]
  );

  return [hostID, startHosting, sendToClients, cleanUp];
}
