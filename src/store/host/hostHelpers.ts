import { captureException } from "@sentry/react";

import { GameStatus } from "models/GameStatus";
import { OtherErrorTypes } from "models/Modals";
import { PlayerState } from "models/PlayerState";
import {
  selectPlayerName,
  updateModalToShow,
} from "store/application/applicationSlice";
import { selectTimeBetweenRounds } from "store/game/gameSlice";
import { store } from "store/rootStore";
import { heroList } from "utils/HeroList";
import { SoundEffects } from "utils/SoundEffectList";
import { Constants } from "utils/constants";

import { incrementRound } from "./hostActions";
import { selectNextRoundTimer } from "./hostSlice";

function reportTargetRoundScoreNotSet() {
  captureException(
    new Error("Target round score was not set during the game.")
  );
  store.dispatch(
    updateModalToShow({
      modal: OtherErrorTypes.GENERIC_ERROR,
    })
  );
}

export function prepareIncrementRound(overrideRound?: number): {
  round: number;
  targetHeroes: number[];
  currentHeroes: number[][];
  statusText: string;
  gameStatus: GameStatus;
  playerName: string;
} {
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

  const currState = store.getState().game;

  if (currState.gameSettings.targetRoundScore === null) {
    reportTargetRoundScoreNotSet();
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

  return {
    round,
    targetHeroes: targetHeroes,
    currentHeroes: currentHeroes,
    statusText,
    gameStatus: GameStatus.PLAYING,
    playerName: selectPlayerName(store.getState()),
  };
}

export function prepareAddSelectedIcon(
  selectedIcon: number,
  selectedPlayerName: string
):
  | {
      isCorrectHero: boolean;
      lastClickedPlayerName: string;
      soundEffect: SoundEffects | undefined;
      nextRoundTimer: NodeJS.Timer | null;
      newState: {
        players: {
          [x: string]: PlayerState;
        };
        selectedIcons: number[];
        invalidIcons: number[];
        statusText: string;
        gameStatus: GameStatus;
      };
    }
  | undefined {
  const currState = store.getState().game;
  const playerName = selectPlayerName(store.getState());

  if (currState.gameSettings.targetRoundScore === null) {
    reportTargetRoundScoreNotSet();
    return;
  }

  // Ignore if we have reached the target for selected icons, or the icon has
  // already been clicked this round, or the player is disabled
  if (
    currState.selectedIcons.length >= currState.gameSettings.targetRoundScore ||
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
  let nextRoundTimer = selectNextRoundTimer(store.getState());

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
          () => store.dispatch(incrementRound()),
          selectTimeBetweenRounds(store.getState()) * 1000
        );
      }
    }
  }

  return {
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
  };
}

export function prepareVisitSettingsPage(isClient: boolean):
  | {
      [x: string]: PlayerState;
    }
  | undefined {
  let players;
  if (isClient === false) {
    // Reset all player scores to 0
    players = { ...store.getState().game.players };
    for (const key in players) {
      const currentPlayer = { ...players[key] };
      currentPlayer.score = 0;
      players[key] = currentPlayer;
    }
  }

  return players;
}
