import Peer from "peerjs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useCallback, useState, useRef } from "react";

import {
  ClientTypeConstants,
  HostDataConnection,
  ClientTypes,
} from "models/MessageClientTypes";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { PeerError } from "models/PeerErrors";
import { useStoreDispatch } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { getAppVersion, getPeerConfig } from "utils/utilities";

type UseClientPeerProps = {
  playerName: string;
  remoteHostID: string;
  onMessageFromHost: (data: HostTypes) => void;
};

type UseClientPeerReturn = [
  () => void,
  (data: ClientTypes) => void,
  () => void
];

// Connects to a host peer
export default function useClientPeer(
  props: UseClientPeerProps
): UseClientPeerReturn {
  const myPeer = useRef<Peer>();
  const isCleaningUp = useRef(false);
  const dispatch = useStoreDispatch();

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

  function connectToHost() {
    const peer = new Peer(getPeerConfig());

    peer.on("open", () => {
      const hostConnection: HostDataConnection = peer.connect(
        props.remoteHostID,
        { metadata: { playerName: props.playerName, version: getAppVersion() } }
      );

      hostConnection.on("open", () => {
        hostConnection.send({
          type: ClientTypeConstants.NEW_CONNECTION,
        });
      });

      hostConnection.on("data", (data: HostTypes) => {
        if (data.type === HostTypeConstants.PLAYER_NAME_TAKEN) {
          hostConnection.metadata = {
            playerName: "",
            version: getAppVersion(),
          };
        }
        props.onMessageFromHost(data);
      });

      hostConnection.on("close", () => {
        if (isCleaningUp.current === false) {
          dispatch({
            type: StoreConstants.SET_MODAL,
            modal: OtherErrorTypes.HOST_DISCONNECTED,
          });
        }
      });

      hostConnection.on("error", (error: PeerError) => {
        dispatch({
          type: StoreConstants.SET_PEER_ERROR,
          error,
        });
        cleanUp();
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

    peer.on("error", (error: PeerError) => {
      dispatch({
        type: StoreConstants.SET_PEER_ERROR,
        error,
      });
      cleanUp();
    });

    myPeer.current = peer;

    return () => {
      cleanUp();
    };
  }

  const sendToHost = useCallback((data: ClientTypes) => {
    if (myPeer.current) {
      for (const key in myPeer.current.connections) {
        myPeer.current.connections[key].forEach(
          (hostConnection: HostDataConnection) => {
            hostConnection.send(data);
          }
        );
      }
    }
  }, []);

  return [connectToHost, sendToHost, cleanUp];
}
