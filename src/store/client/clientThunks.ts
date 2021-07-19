import { setContext, captureException } from "@sentry/react";

import { GameStatus } from "models/GameStatus";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { playAudio } from "store/application/applicationActions";
import {
  selectPlayerName,
  setIsInviteLinkCopied,
} from "store/application/applicationSlice";
import {
  setRound,
  updateSelectedIcons,
  updatePlayersList,
} from "store/game/gameSlice";
import { setSettings } from "store/game/gameThunks";
import { AppThunk } from "store/rootStore";
import { SoundEffects } from "utils/SoundEffectList";

import {
  clientPeerConnectedAction,
  clientPeerStopAction,
} from "./clientActions";
import { setIsNameTaken, clientForcefulDisconnect } from "./clientSlice";

export const handleHostMessage =
  (data: HostTypes): AppThunk =>
  (dispatch, getState) => {
    switch (data.type) {
      case HostTypeConstants.CONNECTION_ACCEPTED: {
        dispatch(clientPeerConnectedAction(data));
        break;
      }

      case HostTypeConstants.PLAYER_NAME_TAKEN: {
        dispatch(setIsNameTaken(true));
        dispatch(clientPeerStopAction());
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
        dispatch(clientPeerStopAction());
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
        if (data.gameStatus === GameStatus.FINISHED) {
          dispatch(playAudio(SoundEffects.Applause));
        } else if (
          data.lastClickedPlayerName === selectPlayerName(getState())
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
