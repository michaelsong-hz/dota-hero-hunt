import { captureException } from "@sentry/react";

import { GameStatus } from "models/GameStatus";
import { HostTypeConstants } from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import {
  playAudio,
  selectPlayerName,
  updateModalToShow,
} from "store/application/applicationSlice";
import {
  updatePlayersList,
  updateSelectedIcons,
  setRound,
  selectTimeBetweenRounds,
} from "store/game/gameSlice";
import { AppThunk, AppDispatch } from "store/rootStore";
import { heroList } from "utils/HeroList";
import { SoundEffects } from "utils/SoundEffectList";
import { Constants } from "utils/constants";

import { hostWSBroadcast } from "../host/hostSlice";

// TODO: This file might be better suited to be under /game after all
// Can have a helper function at the beginning of each function that determines
// if it's a client. Maybe split it into 3 files? One containing the public
// facing method, and then each method contains an if statement to route for
// host or client logic

// TODO: Should this be a thunk?
function reportTargetRoundScoreNotSet(dispatch: AppDispatch) {
  captureException(
    new Error("Target round score was not set during the game.")
  );
  dispatch(updateModalToShow({ modal: OtherErrorTypes.GENERIC_ERROR }));
}

export const startGame = (): AppThunk => (dispatch, getState) => {
  const playerName = selectPlayerName(getState());
  const players = { ...getState().game.players };

  // TODO: This may not be needed
  // Add self to players list (if not yet in players list)
  players[playerName] = {
    score: 0,
    isDisabled: false,
  };

  // TODO: Might move this to endGame() instead
  // Reset all player scores to 0
  for (const key in players) {
    const currentPlayer = { ...players[key] };
    currentPlayer.score = 0;
    players[key] = currentPlayer;
  }

  // TODO: This may not be needed
  dispatch(
    hostWSBroadcast({
      type: HostTypeConstants.UPDATE_PLAYERS_LIST,
      players,
    })
  );
  dispatch(
    updatePlayersList({
      players,
    })
  );

  // Generates the first game state and starts the game
  dispatch(incrementRound(1));
};

export const endGame = (): AppThunk => (dispatch) => {
  dispatch(incrementRound(0));
};

let nextRoundTimer: NodeJS.Timer;
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

    if (!currState.targetHeroes.includes(selectedIcon)) {
      isCorrectHero = false;
      invalidIcons.push(selectedIcon);

      const newPlayerObject = { ...players[selectedPlayerName] };
      newPlayerObject.score -= 1;
      players[selectedPlayerName] = newPlayerObject;
      if (selectedPlayerName === playerName) {
        dispatch(playAudio(SoundEffects.Headshake));
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
        dispatch(playAudio(SoundEffects.Applause));
        if (selectedPlayerName === "") {
          statusText = "Victory!";
        } else {
          statusText = `${selectedPlayerName} wins!`;
        }
        gameStatus = GameStatus.FINISHED;
      } else {
        if (selectedPlayerName === playerName) {
          dispatch(playAudio(SoundEffects.PartyHorn));
        } else {
          dispatch(playAudio(SoundEffects.Frog));
        }
        if (currState.gameSettings.targetRoundScore === selectedIcons.length) {
          statusText = "All heroes found! Get ready for the next round...";
          gameStatus = GameStatus.PLAYING_ROUND_END;

          clearTimeout(nextRoundTimer);
          nextRoundTimer = setTimeout(
            () => dispatch(incrementRound()),
            selectTimeBetweenRounds(getState()) * 1000
          );
        }
      }
    }

    dispatch(
      hostWSBroadcast({
        type: HostTypeConstants.UPDATE_FROM_CLICK,
        isCorrectHero: isCorrectHero,
        players: players,
        lastClickedPlayerName: selectedPlayerName,
        selected: selectedIcons,
        invalidIcons: invalidIcons,
        statusText,
        gameStatus,
      })
    );
    dispatch(
      updateSelectedIcons({
        selectedIcons,
        invalidIcons,
        players,
        statusText,
        gameStatus,
      })
    );
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
      return;
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
    const targetHeroes = shuffle(currentHeroesFlat).slice(
      0,
      currState.gameSettings.targetRoundScore
    );

    // Update game status text
    const statusText = Constants.GAME_STATUS_DEFAULT;

    dispatch(
      hostWSBroadcast({
        type: HostTypeConstants.UPDATE_ROUND,
        round,
        targetHeroes: Array.from(targetHeroes),
        currentHeroes: currentHeroes,
        statusText,
        gameStatus: GameStatus.PLAYING,
      })
    );
    dispatch(
      setRound({
        round,
        targetHeroes: targetHeroes,
        currentHeroes: currentHeroes,
        statusText,
        gameStatus: GameStatus.PLAYING,
      })
    );
  };

// TODO: Add timer for next round

// TODO: Add update game settings reducer

// TODO: Split thunks into folders, this file is growing way too big
