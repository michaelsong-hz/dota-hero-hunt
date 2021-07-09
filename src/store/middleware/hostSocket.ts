import { Middleware, MiddlewareAPI, PayloadAction } from "@reduxjs/toolkit";
import { setContext, captureException, captureMessage } from "@sentry/react";
import Peer from "peerjs";

import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import {
  ClientDataConnection,
  HostTypeConstants,
  HostTypes,
} from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { PeerJSErrorTypes } from "models/PeerErrors";
import { addSelectedIcon } from "store/game/gameHostThunks";
import { updatePlayersList } from "store/game/gameSlice";
import {
  hostForcefulDisconnect,
  hostWSBroadcast,
  setHostID,
} from "store/host/hostSlice";
import { AppDispatch, RootState } from "store/rootStore";
import {
  getPeerConfig,
  getAppVersion,
  getVersionFromConn,
  getPlayerNameFromConn,
} from "utils/utilities";

import { PEER_HOST_BROADCAST, PEER_HOST_START } from "./middlewareConstants";

let peer: Peer | null = null;
const invalidConnLabels: Set<string> = new Set();
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

function onMessage(
  data: ClientTypes,
  clientConnection: Peer.DataConnection,
  dispatch: AppDispatch
) {
  console.log(data);

  const fromPlayerName = getPlayerNameFromConn(clientConnection);

  if (data.type === ClientTypeConstants.PLAYER_ACTION) {
    // TODO: Error handling, checking received data
    dispatch(addSelectedIcon(data.selected, fromPlayerName));
  } else if (data.type === ClientTypeConstants.NEW_CONNECTION) {
    // const currState = store.getState().game;
    // const currentPlayers = { ...currState.players };
    // currentPlayers[fromPlayerName] = {
    //   score: 0,
    //   isDisabled: false,
    // };
    // clientConnection.send({
    //   type: HostTypeConstants.CONNECTION_ACCEPTED,
    //   settings: currState.gameSettings,
    //   players: currState.players,
    //   round: currState.round,
    //   targetHeroes: Array.from(currState.targetHeroes),
    //   currentHeroes: currState.currentHeroes,
    //   selected: Array.from(currState.selectedIcons),
    //   invalidIcons: Array.from(currState.invalidIcons),
    //   statusText: currState.statusText,
    //   gameStatus: currState.gameStatus,
    // });
    // sendToClients({
    //   type: HostTypeConstants.UPDATE_PLAYERS_LIST,
    //   players: currentPlayers,
    // });
    // dispatch({
    //   type: StoreConstants.UPDATE_PLAYERS_LIST,
    //   currentPlayers,
    // });
  } else {
    try {
      const invalidData = JSON.stringify(data);
      setContext("Invalid Data From Client", {
        fromClient: fromPlayerName,
        invalidData: invalidData,
      });
    } catch (err) {
      setContext("Invalid Data From Client", {
        fromClient: fromPlayerName,
      });
    }
    captureException(new Error("Invalid data received from client"));
  }
}

function broadcastMessage(data: HostTypes) {
  if (peer) {
    for (const key in peer.connections) {
      peer.connections[key].forEach(
        (clientConnection: ClientDataConnection) => {
          clientConnection.send(data);
        }
      );
    }
  }
}

function createHostMiddleware(): Middleware {
  return ({ dispatch, getState }: MiddlewareAPI<AppDispatch, RootState>) =>
    (next: AppDispatch) =>
    (action: PayloadAction<AppDispatch>) => {
      if (action.type) {
        switch (action.type) {
          case PEER_HOST_START:
            peer = new Peer(getPeerConfig());

            peer.on("open", () => {
              if (peer !== null) dispatch(setHostID(peer.id));
            });

            peer.on("connection", (incomingConn) => {
              incomingConn.on("open", () => {
                const appVersion = getAppVersion();
                const incomingVersion = getVersionFromConn(incomingConn);
                const incomingPlayerName = getPlayerNameFromConn(incomingConn);
                const currentPlayers = { ...getState().game.players };
                if (incomingVersion !== appVersion) {
                  invalidConnLabels.add(incomingConn.label);
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
                  invalidConnLabels.add(incomingConn.label);
                  incomingConn.send({
                    type: HostTypeConstants.PLAYER_NAME_TAKEN,
                    currentPlayers: currPlayerNames,
                  });
                } else {
                  // TODO: The NEW_CONNECTION type should no longer be needed
                  // const data: ClientTypes = {
                  //   type: ClientTypeConstants.NEW_CONNECTION,
                  // };
                  // onMessage(data, incomingConn);

                  const gameState = getState().game;
                  const fromPlayerName = getPlayerNameFromConn(incomingConn);

                  currentPlayers[fromPlayerName] = {
                    score: 0,
                    isDisabled: false,
                  };

                  incomingConn.send({
                    type: HostTypeConstants.CONNECTION_ACCEPTED,
                    settings: gameState.gameSettings,
                    players: gameState.players,
                    round: gameState.round,
                    targetHeroes: Array.from(gameState.targetHeroes),
                    currentHeroes: gameState.currentHeroes,
                    selected: Array.from(gameState.selectedIcons),
                    invalidIcons: Array.from(gameState.invalidIcons),
                    statusText: gameState.statusText,
                    gameStatus: gameState.gameStatus,
                  });
                  broadcastMessage({
                    type: HostTypeConstants.UPDATE_PLAYERS_LIST,
                    players: currentPlayers,
                  });
                  dispatch(
                    updatePlayersList({
                      players: currentPlayers,
                    })
                  );

                  // TODO: CONNECTION_ACCEPTED is probably no longer needed
                  // incomingConn.send({
                  //   type: HostTypeConstants.CONNECTION_ACCEPTED,
                  // });
                }
              });

              incomingConn.on("data", (data: ClientTypes) => {
                // TODO: The NEW_CONNECTION type should no longer be needed
                if (data.type !== ClientTypeConstants.NEW_CONNECTION) {
                  onMessage(data, incomingConn, dispatch);
                }
              });

              incomingConn.on("close", () => {
                // Remove player from player list on disconnect
                if (!invalidConnLabels.has(incomingConn.label)) {
                  const playerToRemove = getPlayerNameFromConn(incomingConn);
                  const currPlayers = { ...getState().game.players };
                  delete currPlayers[playerToRemove];
                  dispatch(
                    updatePlayersList({
                      players: currPlayers,
                    })
                  );
                } else {
                  // Remove connection from connections with duplicated player
                  // names if they are in the list of duplicated player names
                  invalidConnLabels.delete(incomingConn.label);
                }
              });

              incomingConn.on("error", (err) => {
                try {
                  setContext("Error From Peer", {
                    incomingConn: JSON.stringify(incomingConn),
                  });
                } catch (error) {
                  const incomingPlayerName =
                    getPlayerNameFromConn(incomingConn);
                  setContext("Error From Peer", {
                    incomingConn: incomingPlayerName,
                  });
                }
                captureException(err);
              });
            });

            peer.on("disconnected", () => {
              if (isCleaningUp === false) {
                dispatch(
                  hostForcefulDisconnect(
                    OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED
                  )
                );
              }
              cleanUp();
            });

            peer.on("close", () => {
              if (isCleaningUp === false) {
                dispatch(
                  hostForcefulDisconnect(
                    OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED
                  )
                );
              }
              cleanUp();
            });

            peer.on("error", (error) => {
              // Ignore if it was just losing connection to a fellow peer as it
              // is a non-fatal error
              if (error.type !== PeerJSErrorTypes.PEER_UNAVAILABLE) {
                captureMessage(error.type);
                captureException(error);
                dispatch(hostForcefulDisconnect(error.type));
                cleanUp();
              }
            });
            break;

          case PEER_HOST_BROADCAST:
            if (hostWSBroadcast.match(action)) {
              broadcastMessage(action.payload);
            } else {
              console.log("report sentry error");
            }
            break;
        }
      }
      return next(action);
    };
}

export const hostMiddleware = createHostMiddleware();
