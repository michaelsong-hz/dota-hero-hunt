import { Middleware, MiddlewareAPI, PayloadAction } from "@reduxjs/toolkit";
import { setContext, captureException, captureMessage } from "@sentry/react";
import Peer from "peerjs";

import { GameStatus } from "models/GameStatus";
import { HostDataConnection } from "models/MessageClientTypes";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { PeerError, PeerJSErrorTypes } from "models/PeerErrors";
import {
  playAudio,
  selectPlayerName,
} from "store/application/applicationSlice";
import {
  clientForcefulDisconnect,
  clientWSSend,
  setIsNameTaken,
  setRemoteHostID,
} from "store/client/clientSlice";
import {
  setRound,
  setSettings,
  updatePlayersList,
  updateSelectedIcons,
} from "store/game/gameSlice";
import { AppDispatch, RootState, store } from "store/rootStore";
import { SoundEffects } from "utils/SoundEffectList";
import { getPeerConfig, getAppVersion } from "utils/utilities";

import { PEER_CLIENT_CONNECT, PEER_CLIENT_SEND } from "./middlewareConstants";

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

function onMessageFromHost(data: HostTypes, dispatch: AppDispatch) {
  console.log(data);

  switch (data.type) {
    case HostTypeConstants.CONNECTION_ACCEPTED: {
      dispatch(
        setSettings({
          gameSettings: data.settings,
        })
      );
      dispatch(
        setRound({
          round: data.round,
          targetHeroes: data.targetHeroes,
          currentHeroes: data.currentHeroes,
          statusText: data.statusText,
          gameStatus: data.gameStatus,
        })
      );
      dispatch(
        updateSelectedIcons({
          selectedIcons: data.selected,
          invalidIcons: data.invalidIcons,
          players: data.players,
          statusText: data.statusText,
          gameStatus: data.gameStatus,
        })
      );
      dispatch(setRemoteHostID(getRemoteHostID()));
      break;
    }
    case HostTypeConstants.UPDATE_PLAYERS_LIST: {
      dispatch(
        updatePlayersList({
          players: data.players,
        })
      );
      break;
    }
    case HostTypeConstants.PLAYER_NAME_TAKEN: {
      dispatch(setIsNameTaken(true));
      cleanUp();
      break;
    }
    case HostTypeConstants.APP_VERSION_MISMATCH: {
      dispatch(
        clientForcefulDisconnect(OtherErrorTypes.APP_VERSION_MISMATCH, [
          `The application version does not match between yourself, and the \
             person who invited you.`,
          `Your version: ${data.clientVersion}`,
          `The inviter's version: ${data.hostVersion}`,
          `Please try refreshing your game, or tell the person who invited \
             you to refresh their game in order to get the latest update.`,
        ])
      );

      cleanUp();
      break;
    }
    case HostTypeConstants.UPDATE_SETTINGS: {
      dispatch(
        setSettings({
          gameSettings: data.settings,
        })
      );
      break;
    }
    case HostTypeConstants.UPDATE_ROUND: {
      dispatch(
        setRound({
          round: data.round,
          targetHeroes: data.targetHeroes,
          currentHeroes: data.currentHeroes,
          statusText: data.statusText,
          gameStatus: data.gameStatus,
        })
      );
      break;
    }
    case HostTypeConstants.UPDATE_FROM_CLICK: {
      if (data.gameStatus === GameStatus.FINISHED) {
        dispatch(playAudio(SoundEffects.Applause));
      } else if (
        data.lastClickedPlayerName === selectPlayerName(store.getState())
      ) {
        if (data.isCorrectHero) {
          dispatch(playAudio(SoundEffects.PartyHorn));
        } else {
          dispatch(playAudio(SoundEffects.Headshake));
        }
      } else if (data.isCorrectHero) {
        dispatch(playAudio(SoundEffects.Frog));
      }
      dispatch(
        updateSelectedIcons({
          invalidIcons: data.invalidIcons,
          selectedIcons: data.selected,
          players: data.players,
          statusText: data.statusText,
          gameStatus: data.gameStatus,
        })
      );
      break;
    }
    default: {
      try {
        const invalidData = JSON.stringify(data);
        setContext("Invalid Data From Host", {
          fromHost: invalidData,
        });
      } catch (err) {
        captureException(err);
      }
      captureException(new Error("Invalid data received from host"));
    }
  }
}

function createClientMiddleware(): Middleware {
  return ({ dispatch, getState }: MiddlewareAPI<AppDispatch, RootState>) =>
    (next: AppDispatch) =>
    (action: PayloadAction<AppDispatch>) => {
      if (action.type) {
        switch (action.type) {
          case PEER_CLIENT_CONNECT:
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
                  onMessageFromHost(data, dispatch);
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

          case PEER_CLIENT_SEND:
            if (peer && clientWSSend.match(action)) {
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
