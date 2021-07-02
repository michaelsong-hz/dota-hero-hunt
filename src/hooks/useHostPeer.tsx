import { captureException, captureMessage, setContext } from "@sentry/react";
import Peer from "peerjs";
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
import {
  getPlayerNameFromConn,
  getPeerConfig,
  getAppVersion,
  getVersionFromConn,
} from "utils/utilities";

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
  const invalidConnLabels = useRef<Set<string>>(new Set());

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
        myPeer.current = undefined;
      }
    }
  }, []);

  const startHosting = useCallback(() => {
    const peer = new Peer(getPeerConfig());

    peer.on("open", () => {
      setHostID(peer.id);
    });

    peer.on("connection", (incomingConn) => {
      incomingConn.on("open", () => {
        const appVersion = getAppVersion();
        const incomingVersion = getVersionFromConn(incomingConn);
        const incomingPlayerName = getPlayerNameFromConn(incomingConn);

        const currentPlayers = stateRef.current.players;
        if (incomingVersion !== appVersion) {
          invalidConnLabels.current.add(incomingConn.label);

          incomingConn.send({
            type: HostTypeConstants.APP_VERSION_MISMATCH,
            hostVersion: appVersion,
            clientVersion: incomingVersion,
          });
        }
        // TODO: Perform validation on incomingPlayerName
        else if (
          incomingPlayerName in currentPlayers ||
          incomingPlayerName === ""
        ) {
          // Let client know that the player name has been taken
          const currPlayerNames: string[] = [];

          for (const currPlayerName of Object.keys(currentPlayers)) {
            currPlayerNames.push(currPlayerName);
          }
          invalidConnLabels.current.add(incomingConn.label);

          incomingConn.send({
            type: HostTypeConstants.PLAYER_NAME_TAKEN,
            currentPlayers: currPlayerNames,
          });
        } else {
          // TODO: The NEW_CONNECTION type should no longer be needed
          const data: ClientTypes = {
            type: ClientTypeConstants.NEW_CONNECTION,
          };
          onMessage(data, incomingConn);
        }
      });

      incomingConn.on("data", (data: ClientTypes) => {
        if (data.type !== ClientTypeConstants.NEW_CONNECTION) {
          onMessage(data, incomingConn);
        }
      });

      incomingConn.on("close", () => {
        // Remove player from player list on disconnect
        if (!invalidConnLabels.current.has(incomingConn.label)) {
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
          invalidConnLabels.current.delete(incomingConn.label);
        }
      });

      incomingConn.on("error", (err) => {
        try {
          setContext("Error From Peer", {
            incomingConn: JSON.stringify(incomingConn),
          });
        } catch (error) {
          const incomingPlayerName = getPlayerNameFromConn(incomingConn);
          setContext("Error From Peer", {
            incomingConn: incomingPlayerName,
          });
        }

        captureException(err);
      });
    });

    peer.on("disconnected", () => {
      if (isCleaningUp.current === false) {
        dispatch({
          type: StoreConstants.SET_MODAL,
          modal: OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED,
        });
      }
      cleanUp();
    });

    peer.on("close", () => {
      if (isCleaningUp.current === false) {
        dispatch({
          type: StoreConstants.SET_MODAL,
          modal: OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED,
        });
      }
      cleanUp();
    });

    peer.on("error", (error) => {
      // Ignore if it was just losing connection to a fellow peer as it is a
      // non-fatal error
      if (error.type !== PeerJSErrorTypes.PEER_UNAVAILABLE) {
        captureMessage(error.type);
        captureException(error);
        dispatch({
          type: StoreConstants.SET_PEER_ERROR,
          error,
        });
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
