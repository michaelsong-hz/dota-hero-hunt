import { Middleware, MiddlewareAPI, PayloadAction } from "@reduxjs/toolkit";
import { setContext, captureException, captureMessage } from "@sentry/react";
import Peer from "peerjs";

import { GameStatus } from "models/GameStatus";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import {
  ClientDataConnection,
  HostTypeConstants,
  HostTypes,
} from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { PeerJSErrorTypes } from "models/PeerErrors";
import { updatePlayersList } from "store/game/gameSlice";
import {
  addSelectedIconAction,
  incrementRoundAction,
  modifyGameSettingsAction,
  submitPlayerNameAction,
  visitSettingsPageAction,
} from "store/host/hostActions";
import {
  HOST_INCREMENT_ROUND,
  HOST_MODIFY_SETTINGS,
  HOST_PEER_START,
  HOST_PEER_STOP,
  HOST_SELECT_ICON,
  HOST_SUBMIT_PLAYER_NAME,
  HOST_VISIT_SETTINGS,
} from "store/host/hostConstants";
import {
  selectHostID,
  selectHostModifiedGameSettings,
  setHostIDAndCopyLink,
} from "store/host/hostSlice";
import { addSelectedIcon, hostForcefulDisconnect } from "store/host/hostThunks";
import { AppDispatch, RootState } from "store/rootStore";
import {
  getPeerConfig,
  getAppVersion,
  getVersionFromConn,
  getPlayerNameFromConn,
} from "utils/utilities";

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
  clientConnection: ClientDataConnection,
  dispatch: AppDispatch
) {
  const fromPlayerName = getPlayerNameFromConn(clientConnection);

  if (data.type === ClientTypeConstants.PLAYER_ACTION) {
    // TODO: Error handling, checking received data
    dispatch(addSelectedIcon(data.selected, fromPlayerName));
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
          case HOST_PEER_START:
            peer = new Peer(getPeerConfig());

            peer.on("open", () => {
              if (peer !== null) dispatch(setHostIDAndCopyLink(peer.id));
            });

            peer.on("connection", (incomingConn: ClientDataConnection) => {
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
                  const gameState = getState().game;
                  let gameSettings = gameState.gameSettings;
                  const modifiedGameSettings = selectHostModifiedGameSettings(
                    getState()
                  );
                  // If on the settings page, send the settings being modified
                  // instead
                  if (window.location.href.split("/")[3] === "settings") {
                    gameSettings = modifiedGameSettings;
                  }

                  const fromPlayerName = getPlayerNameFromConn(incomingConn);

                  currentPlayers[fromPlayerName] = {
                    score: 0,
                    isDisabled: false,
                  };

                  incomingConn.send({
                    type: HostTypeConstants.CONNECTION_ACCEPTED,
                    settings: gameSettings,
                    players: gameState.players,
                    round: gameState.round,
                    targetHeroes: Array.from(gameState.targetHeroes),
                    currentHeroes: gameState.currentHeroes,
                    selected: Array.from(gameState.selectedIcons),
                    invalidIcons: Array.from(gameState.invalidIcons),
                    statusText: gameState.statusText,
                    gameStatus: gameState.gameStatus,
                    hostID: selectHostID(getState()) || "",
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
                }
              });

              incomingConn.on("data", (data: ClientTypes) => {
                onMessage(data, incomingConn, dispatch);
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

          case HOST_PEER_STOP:
            cleanUp();
            break;

          case HOST_INCREMENT_ROUND:
            if (incrementRoundAction.match(action))
              broadcastMessage({
                type: HostTypeConstants.UPDATE_ROUND,
                round: action.payload.round,
                targetHeroes: action.payload.targetHeroes,
                currentHeroes: action.payload.currentHeroes,
                statusText: action.payload.statusText,
                gameStatus: action.payload.gameStatus,
              });
            break;

          case HOST_SELECT_ICON:
            if (addSelectedIconAction.match(action))
              broadcastMessage({
                type: HostTypeConstants.SELECT_ICON,
                isCorrectHero: action.payload.isCorrectHero,
                lastClickedPlayerName: action.payload.lastClickedPlayerName,
                players: action.payload.newState.players,
                selected: action.payload.newState.selectedIcons,
                invalidIcons: action.payload.newState.invalidIcons,
                statusText: action.payload.newState.statusText,
                gameStatus: action.payload.newState.gameStatus,
              });
            break;

          // TODO: Probably want a custom host type to end the game
          case HOST_VISIT_SETTINGS:
            if (visitSettingsPageAction.match(action)) {
              broadcastMessage({
                type: HostTypeConstants.UPDATE_ROUND,
                round: 0,
                targetHeroes: [],
                currentHeroes: [],
                statusText: "",
                gameStatus: GameStatus.SETTINGS,
              });
              if (action.payload.players)
                broadcastMessage({
                  type: HostTypeConstants.UPDATE_PLAYERS_LIST,
                  players: action.payload.players,
                });
            }
            break;

          case HOST_MODIFY_SETTINGS:
            if (modifyGameSettingsAction.match(action)) {
              broadcastMessage({
                type: HostTypeConstants.UPDATE_SETTINGS,
                settings: action.payload,
              });
            }
            break;

          case HOST_SUBMIT_PLAYER_NAME:
            if (submitPlayerNameAction.match(action)) {
              broadcastMessage({
                type: HostTypeConstants.UPDATE_PLAYERS_LIST,
                players: action.payload.players,
              });
            }
            break;
        }
      }
      return next(action);
    };
}

export const hostMiddleware = createHostMiddleware();
