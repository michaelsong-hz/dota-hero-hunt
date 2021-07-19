import { captureException } from "@sentry/react";
import localForage from "localforage";

import { GameSettings } from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { Modals, OtherErrorTypes, RegularModals } from "models/Modals";
import { PlayerState } from "models/PlayerState";
import {
  selectPlayerName,
  updateModalToShow,
} from "store/application/applicationSlice";
import { selectTimeBetweenRounds } from "store/game/gameSlice";
import { AppDispatch, AppThunk } from "store/rootStore";
import { heroList } from "utils/HeroList";
import { SoundEffects } from "utils/SoundEffectList";
import { Constants, StorageConstants } from "utils/constants";

import {
  submitPlayerNameAction,
  modifyGameSettingsAction,
  incrementRoundAction,
  addSelectedIconAction,
  visitSettingsPageAction,
  hostForcefulDisconnectAction,
  hostPeerStartAction,
  hostPeerStopAction,
} from "./hostActions";
import { selectNextRoundTimer } from "./hostSlice";

function reportTargetRoundScoreNotSet(dispatch: AppDispatch) {
  captureException(
    new Error("Target round score was not set during the game.")
  );
  dispatch(
    updateModalToShow({
      modal: OtherErrorTypes.GENERIC_ERROR,
    })
  );
}

export const startHosting = (): AppThunk => (dispatch, getState) => {
  const playerName = selectPlayerName(getState());
  if (playerName === "") {
    dispatch(updateModalToShow({ modal: RegularModals.PLAYER_NAME_MODAL }));
  } else {
    dispatch(hostPeerStart());
  }
};

export const stopHosting = (): AppThunk => (dispatch) => {
  dispatch(hostPeerStop());
};

export const incrementRound =
  (overrideRound?: number): AppThunk =>
  (dispatch, getState) => {
    // Shuffles provided array
    // Could be better optimized to stop after reaching target count
    function shuffle(array: number[]) {
      let i = array.length,
        j = 0,
        temp;

      while (i--) {
        j = Math.floor(Math.random() * (i + 1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    }

    const currState = getState().game;

    if (currState.gameSettings.targetRoundScore === null) {
      reportTargetRoundScoreNotSet(dispatch);
    }

    let round = currState.round + 1;
    if (overrideRound !== undefined) {
      round = overrideRound;
    }

    // Build and shuffle new 2d array of hero icons
    const allHeroIcons: number[] = [];
    heroList.forEach((hero, i) => {
      allHeroIcons.push(i);
    });
    const rowTarget = currState.gameSettings.columns;
    const totalHeroes =
      currState.gameSettings.columns * currState.gameSettings.rows;

    const currentHeroesFlat = shuffle(allHeroIcons).slice(0, totalHeroes);
    const currentHeroes: number[][] = [];
    let currentRow: number[] = [];
    currentHeroesFlat.forEach((hero, i) => {
      currentRow.push(hero);
      if ((i + 1) % rowTarget === 0) {
        currentHeroes.push(currentRow);
        currentRow = [];
      }
    });

    // Build set of heroes to search for next round
    const targetRoundScore = currState.gameSettings.targetRoundScore || 0;
    const targetHeroes = shuffle(currentHeroesFlat).slice(0, targetRoundScore);

    // Update game status text
    const statusText = Constants.GAME_STATUS_DEFAULT;

    // If starting a new game, modify some player attributes
    const players = { ...getState().game.players };
    if (round === 1) {
      // Ensure host is in players list
      players[selectPlayerName(getState())] = {
        score: 0,
        isDisabled: false,
      };

      // Reset all player scores to 0
      for (const key in players) {
        const currentPlayer = { ...players[key] };
        currentPlayer.score = 0;
        players[key] = currentPlayer;
      }
    }

    dispatch(
      incrementRoundAction({
        round,
        targetHeroes: targetHeroes,
        currentHeroes: currentHeroes,
        statusText,
        gameStatus: GameStatus.PLAYING,
        playerName: selectPlayerName(getState()),
        players,
      })
    );
  };

export const addSelectedIcon =
  (selectedIcon: number, selectedPlayerName: string): AppThunk =>
  (dispatch, getState) => {
    const currState = getState().game;
    const playerName = selectPlayerName(getState());

    if (currState.gameSettings.targetRoundScore === null) {
      reportTargetRoundScoreNotSet(dispatch);
      return;
    }

    // Ignore if we have reached the target for selected icons, or the icon has
    // already been clicked this round, or the player is disabled
    if (
      currState.selectedIcons.length >=
        currState.gameSettings.targetRoundScore ||
      currState.selectedIcons.includes(selectedIcon) ||
      currState.invalidIcons.includes(selectedIcon) ||
      currState.players[selectedPlayerName].isDisabled ||
      currState.gameStatus !== GameStatus.PLAYING
    ) {
      return;
    }

    const selectedIcons = [...currState.selectedIcons];
    const invalidIcons = [...currState.invalidIcons];
    const players = { ...currState.players };
    let gameStatus: GameStatus = currState.gameStatus;
    let isCorrectHero;
    let statusText = Constants.GAME_STATUS_DEFAULT;
    let soundEffect;
    let nextRoundTimer = selectNextRoundTimer(getState());

    if (!currState.targetHeroes.includes(selectedIcon)) {
      isCorrectHero = false;
      invalidIcons.push(selectedIcon);

      const newPlayerObject = { ...players[selectedPlayerName] };
      newPlayerObject.score -= 1;
      players[selectedPlayerName] = newPlayerObject;
      if (selectedPlayerName === playerName) {
        soundEffect = SoundEffects.Headshake;
      }
    } else {
      isCorrectHero = true;
      selectedIcons.push(selectedIcon);
      const newPlayerObject = { ...players[selectedPlayerName] };
      newPlayerObject.score += 1;
      players[selectedPlayerName] = newPlayerObject;

      if (
        currState.gameSettings.targetTotalScore ===
        players[selectedPlayerName].score
      ) {
        // A player has won the game
        soundEffect = SoundEffects.Applause;
        if (selectedPlayerName === "") {
          statusText = "Victory!";
        } else {
          statusText = `${selectedPlayerName} wins!`;
        }
        gameStatus = GameStatus.FINISHED;
      } else {
        if (selectedPlayerName === playerName) {
          soundEffect = SoundEffects.PartyHorn;
        } else {
          soundEffect = SoundEffects.Frog;
        }
        if (currState.gameSettings.targetRoundScore === selectedIcons.length) {
          statusText = "All heroes found! Get ready for the next round...";
          gameStatus = GameStatus.PLAYING_ROUND_END;

          if (nextRoundTimer) {
            clearTimeout(nextRoundTimer);
          }
          nextRoundTimer = setTimeout(
            () => dispatch(incrementRound()),
            selectTimeBetweenRounds(getState()) * 1000
          );
        }
      }
    }

    dispatch(
      addSelectedIconAction({
        isCorrectHero: isCorrectHero,
        lastClickedPlayerName: selectedPlayerName,
        soundEffect,
        nextRoundTimer: nextRoundTimer,
        newState: {
          players: players,
          selectedIcons: selectedIcons,
          invalidIcons: invalidIcons,
          statusText,
          gameStatus,
        },
      })
    );
  };

export const visitSettingsPage =
  (settings: GameSettings): AppThunk =>
  (dispatch) => {
    dispatch(visitSettingsPageAction(settings));
  };

export const modifyGameSettings =
  (gameSettings: GameSettings): AppThunk =>
  (dispatch) => {
    dispatch(modifyGameSettingsAction(gameSettings));
  };

export const submitPlayerName =
  (submittedPlayerName: string): AppThunk =>
  (dispatch, getState) => {
    // Save new player name locally
    localForage.setItem(StorageConstants.PLAYER_NAME, submittedPlayerName);
    // Close modal asking for player name input
    dispatch(updateModalToShow({ modal: null }));

    const playerName = selectPlayerName(getState());
    const players = { ...getState().game.players };

    const currentPlayers: Record<string, PlayerState> = {};

    // Omits old name in the new player list, adds new name
    for (const [storePlayerName, storePlayer] of Object.entries(players)) {
      if (storePlayerName !== playerName) {
        currentPlayers[storePlayerName] = storePlayer;
      } else {
        currentPlayers[submittedPlayerName] = storePlayer;
      }
    }

    dispatch(
      submitPlayerNameAction({
        playerName: submittedPlayerName,
        players: currentPlayers,
      })
    );
  };

export const hostPeerStart = (): AppThunk => (dispatch, getState) => {
  dispatch(hostPeerStartAction(selectPlayerName(getState())));
};

export const hostPeerStop = (): AppThunk => (dispatch) => {
  dispatch(hostPeerStopAction());
};

export const hostForcefulDisconnect =
  (modal: Modals, message?: string[]): AppThunk =>
  (dispatch) => {
    dispatch(hostForcefulDisconnectAction({ modal, message }));
  };
