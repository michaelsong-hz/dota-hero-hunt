import { setContext, captureException } from "@sentry/react";
import localForage from "localforage";

import { GameStatus } from "models/GameStatus";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { Modals, OtherErrorTypes } from "models/Modals";
import {
  selectPlayerName,
  setIsInviteLinkCopied,
  updateModalToShow,
} from "store/application/applicationSlice";
import { setRound, updatePlayersList } from "store/game/gameSlice";
import { initializeSettingsAsync, setSettings } from "store/game/gameThunks";
import { AppThunk } from "store/rootStore";
import { SoundEffects } from "utils/SoundEffectList";
import { StorageConstants } from "utils/constants";

import {
  clientIconUpdateAction,
  clientNameChangeAction,
  clientPeerConnectedAction,
  clientPeerStartAction,
  clientPeerStopAction,
} from "./clientActions";
import { selectIsJoiningGame } from "./clientSlice";

export const clientPeerStart = (): AppThunk => (dispatch, getState) => {
  // Proceed if not currently joining a game
  if (selectIsJoiningGame(getState()) === false) {
    dispatch(clientPeerStartAction());
    localForage.setItem(
      StorageConstants.PLAYER_NAME,
      selectPlayerName(getState())
    );
  }
};

/**
 * Called when the client manually disconnects from the game
 */
export const clientPeerDisconnect = (): AppThunk => (dispatch) => {
  dispatch(clientPeerStop());
  dispatch(initializeSettingsAsync());
};

/**
 * Called when the client failed to negotiate a proper connection with the host
 * and needs to disconnect
 * @param nameTaken Boolean set to true if the reason for disconnecting was
 * because the player name was taken
 */
export const clientPeerStop =
  (nameTaken?: boolean): AppThunk =>
  (dispatch, getState) => {
    dispatch(
      clientPeerStopAction({
        playerName: selectPlayerName(getState()),
        nameTaken,
      })
    );
  };

/**
 * Called when the client is forcefully disconnected (by network errors)
 * @param modal Type of modal to display
 * @param message Custom message in the modal, if any
 */
export const clientForcefulDisconnect =
  (modal: Modals, message?: string[]): AppThunk =>
  (dispatch) => {
    dispatch(clientPeerStop());
    dispatch(updateModalToShow({ modal, message }));
  };

export const clientNameChange =
  (newPlayerName: string): AppThunk =>
  (dispatch) => {
    dispatch(clientNameChangeAction(newPlayerName));
  };

export const handleHostMessage =
  (data: HostTypes): AppThunk =>
  (dispatch, getState) => {
    switch (data.type) {
      case HostTypeConstants.CONNECTION_ACCEPTED: {
        dispatch(clientPeerConnectedAction(data));
        break;
      }

      case HostTypeConstants.PLAYER_NAME_TAKEN: {
        dispatch(clientPeerStop(true));
        break;
      }

      case HostTypeConstants.APP_VERSION_MISMATCH: {
        dispatch(
          clientForcefulDisconnect(OtherErrorTypes.APP_VERSION_MISMATCH, [
            `The application version does not match between yourself, and the \
             person who invited you.`,
            `Your version: ${data.clientVersion}`,
            `The inviter's version: ${data.hostVersion}`,
            `Please try reloading your game, or tell the person who invited \
             you to reload their game in order to get the latest update.`,
          ])
        );
        break;
      }

      case HostTypeConstants.UPDATE_ROUND: {
        if (data.gameStatus === GameStatus.SETTINGS) {
          dispatch(setIsInviteLinkCopied(false));
        }
        dispatch(
          setRound({
            round: data.round,
            targetHeroes: data.targetHeroes,
            currentHeroes: data.currentHeroes,
            statusText: data.statusText,
            gameStatus: data.gameStatus,
            players: data.players,
          })
        );
        break;
      }

      case HostTypeConstants.SELECT_ICON: {
        let soundEffect;
        if (data.gameStatus === GameStatus.FINISHED) {
          soundEffect = SoundEffects.Applause;
        } else if (
          data.lastClickedPlayerName === selectPlayerName(getState())
        ) {
          if (data.isCorrectHero) {
            soundEffect = SoundEffects.PartyHorn;
          } else {
            soundEffect = SoundEffects.Headshake;
          }
        } else if (data.isCorrectHero) {
          soundEffect = SoundEffects.Frog;
        }
        dispatch(
          clientIconUpdateAction({
            invalidIcons: data.invalidIcons,
            selectedIcons: data.selected,
            players: data.players,
            statusText: data.statusText,
            gameStatus: data.gameStatus,
            soundEffect,
          })
        );
        break;
      }

      case HostTypeConstants.UPDATE_SETTINGS: {
        dispatch(setSettings(data.settings));
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
  };
