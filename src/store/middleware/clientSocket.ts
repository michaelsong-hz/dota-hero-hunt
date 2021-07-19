import { Middleware, MiddlewareAPI, PayloadAction } from "@reduxjs/toolkit";
import { captureException, captureMessage } from "@sentry/react";
import Peer from "peerjs";

import { HostDataConnection } from "models/MessageClientTypes";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { PeerError, PeerJSErrorTypes } from "models/PeerErrors";
import { selectPlayerName } from "store/application/applicationSlice";
import { clientPeerSendAction } from "store/client/clientActions";
import {
  CLIENT_PEER_SEND,
  CLIENT_PEER_START,
  CLIENT_PEER_STOP,
} from "store/client/clientConstants";
import { clientForcefulDisconnect } from "store/client/clientSlice";
import { handleHostMessage } from "store/client/clientThunks";
import { AppDispatch, RootState } from "store/rootStore";
import { getPeerConfig, getAppVersion } from "utils/utilities";

let peer: Peer | null = null;
let isCleaningUp = false;

function cleanUp() {
  isCleaningUp = true;
  if (peer) {
    if (!peer.disconnected) {
      peer.disconnect();
    } else if (!peer.destroyed) {
      peer.destroy();
    } else {
      peer = null;
    }
  }
}

function getRemoteHostID() {
  return window.location.pathname.split("/").slice(-1)[0];
}

function createClientMiddleware(): Middleware {
  return ({ dispatch, getState }: MiddlewareAPI<AppDispatch, RootState>) =>
    (next: AppDispatch) =>
    (action: PayloadAction<AppDispatch>) => {
      if (action.type) {
        switch (action.type) {
          case CLIENT_PEER_START:
            peer = new Peer(getPeerConfig());

            peer.on("open", () => {
              if (peer) {
                const hostConnection: HostDataConnection = peer.connect(
                  getRemoteHostID(),
                  {
                    metadata: {
                      playerName: selectPlayerName(getState()),
                      version: getAppVersion(),
                    },
                  }
                );

                hostConnection.on("data", (data: HostTypes) => {
                  if (data.type === HostTypeConstants.PLAYER_NAME_TAKEN) {
                    hostConnection.metadata = {
                      playerName: "",
                      version: getAppVersion(),
                    };
                  }
                  dispatch(handleHostMessage(data));
                });

                hostConnection.on("close", () => {
                  if (isCleaningUp === false) {
                    dispatch(
                      clientForcefulDisconnect(
                        OtherErrorTypes.HOST_DISCONNECTED
                      )
                    );
                  }
                });

                hostConnection.on("error", (error: PeerError) => {
                  // Check if we lost connection to the host - not a defined error type
                  // by peer js so we'll set our own

                  // Hack to access the hidden object in peer js to let us know if we
                  // were connected before
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const hostConnections: number = (peer as any)._connections
                    .size;
                  if (
                    hostConnections > 0 &&
                    error.type === undefined &&
                    error.message.substr(0, 28) ===
                      "Negotiation of connection to"
                  ) {
                    error.type = PeerJSErrorTypes.LOST_CONN_TO_HOST;
                  } else {
                    captureMessage(error.type);
                    captureException(error);
                  }

                  dispatch(clientForcefulDisconnect(error.type));
                  cleanUp();
                });
              }
            });

            peer.on("disconnected", () => {
              if (isCleaningUp === false) {
                dispatch(
                  clientForcefulDisconnect(
                    OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED
                  )
                );
              }
              cleanUp();
            });

            peer.on("close", () => {
              if (isCleaningUp === false) {
                dispatch(
                  clientForcefulDisconnect(
                    OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED
                  )
                );
              }
              cleanUp();
            });

            peer.on("error", (error: PeerError) => {
              dispatch(clientForcefulDisconnect(error.type));
              cleanUp();
            });
            break;

          case CLIENT_PEER_STOP:
            cleanUp();
            break;

          case CLIENT_PEER_SEND:
            if (peer && clientPeerSendAction.match(action)) {
              for (const key in peer.connections) {
                peer.connections[key].forEach(
                  (hostConnection: HostDataConnection) => {
                    hostConnection.send(action.payload);
                  }
                );
              }
            }
            break;
        }
      }
      return next(action);
    };
}

export const clientMiddleware = createClientMiddleware();
