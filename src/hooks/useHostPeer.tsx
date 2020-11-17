import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useRef, useCallback } from "react";

import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import {
  ClientDataConnection,
  HostTypeConstants,
  HostTypes,
} from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { PeerJSErrorTypes } from "models/PeerErrors";
import { useStoreDispatch } from "reducer/store";
import { StoreConstants, StoreReducer } from "reducer/storeReducer";
import { getPlayerNameFromConn, getPeerConfig } from "utils/utilities";

type UseHostPeerProps = {
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
  const isCleaningUp = useRef(false);
  const dupConnLabels = useRef<Set<string>>(new Set());

  const dispatch = useStoreDispatch();
  const { stateRef, onMessage } = props;

  const cleanUp = useCallback(() => {
    isCleaningUp.current = true;
    if (myPeer.current) {
      if (!myPeer.current.disconnected) {
        myPeer.current.disconnect();
      } else if (!myPeer.current.destroyed) {
        myPeer.current.destroy();
      } else {
        console.log("Peer: cleanup complete");
        myPeer.current = undefined;
      }
    } else {
      console.log("Peer: nothing to cleanup");
    }
  }, []);

  const startHosting = useCallback(() => {
    const peer = new Peer(getPeerConfig());

    peer.on("open", () => {
      setHostID(peer.id);
    });

    peer.on("connection", (incomingConn) => {
      incomingConn.on("data", (data: ClientTypes) => {
        const incomingPlayerName = getPlayerNameFromConn(incomingConn);
        console.log("Peer: received data", incomingPlayerName, data);

        const currentPlayers = stateRef.current.players;
        if (
          data.type === ClientTypeConstants.NEW_CONNECTION &&
          incomingPlayerName in currentPlayers
        ) {
          // Let client know that the player name has been taken
          const currPlayerNames: string[] = [];

          for (const currPlayerName of Object.keys(currentPlayers)) {
            currPlayerNames.push(currPlayerName);
          }
          dupConnLabels.current.add(incomingConn.label);

          incomingConn.send({
            type: HostTypeConstants.PLAYER_NAME_TAKEN,
            currentPlayers: currPlayerNames,
          });
        } else {
          onMessage(data, incomingConn);
        }
      });

      incomingConn.on("close", () => {
        const incomingPlayerName = getPlayerNameFromConn(incomingConn);
        console.log("Peer: disconnected", incomingPlayerName);
        // Remove player from player list on disconnect
        if (!dupConnLabels.current.has(incomingConn.label)) {
          const playerToRemove = getPlayerNameFromConn(incomingConn);

          const currPlayers = stateRef.current.players;
          delete currPlayers[playerToRemove];
          dispatch({
            type: StoreConstants.UPDATE_PLAYERS_LIST,
            currentPlayers: currPlayers,
          });
        } else {
          // Remove connection from connections with duplicated player names
          // if they are in the list of duplicated player names
          dupConnLabels.current.delete(incomingConn.label);
        }
      });

      incomingConn.on("error", () => {
        const incomingPlayerName = getPlayerNameFromConn(incomingConn);
        console.log("peer error", incomingPlayerName);
      });
    });

    peer.on("disconnected", () => {
      if (isCleaningUp.current === false) {
        console.log("Server disconnected");
        dispatch({
          type: StoreConstants.SET_MODAL,
          modal: OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED,
        });
      }
      cleanUp();
    });

    peer.on("close", () => {
      if (isCleaningUp.current === false) {
        console.log("Server connection closed");
        dispatch({
          type: StoreConstants.SET_MODAL,
          modal: OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED,
        });
      }
      cleanUp();
    });

    peer.on("error", (error) => {
      if (error.type === PeerJSErrorTypes.PEER_UNAVAILABLE) {
        console.log("ERROR: Lost connection to peer", error);
      } else {
        console.log("Peer: Server error", error.type, error);
        cleanUp();
      }
    });

    myPeer.current = peer;
    return () => {
      cleanUp();
    };
  }, [cleanUp, dispatch, onMessage, stateRef]);

  const sendToClients = useCallback((data: HostTypes) => {
    if (myPeer.current) {
      for (const key in myPeer.current.connections) {
        myPeer.current.connections[key].forEach(
          (clientConnection: ClientDataConnection) => {
            clientConnection.send(data);
          }
        );
      }
    }
  }, []);

  return [hostID, startHosting, sendToClients, cleanUp];
}
