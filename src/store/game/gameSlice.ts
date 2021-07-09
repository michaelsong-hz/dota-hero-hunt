import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { PlayerState } from "models/PlayerState";
import { RootState } from "store/rootStore";

export interface GameState {
  round: number;
  players: Record<string, PlayerState>;
  // Would prefer sets for quite a few of these, but they're "not serializable"
  // https://redux.js.org/style-guide/style-guide#do-not-put-non-serializable-values-in-state-or-actions
  selectedIcons: number[];
  invalidIcons: number[];
  targetHeroes: number[];
  currentHeroes: number[][];
  gameSettings: GameSettings;
  // appSettings: ApplicationSettings;
  // modalToShow: Modals | null;
  // modalCustomMessage: string[];
  statusText: string;
  gameStatus: GameStatus;
  // connectionStatus: ConnectionStatus;
}

const initialState: GameState = {
  round: 0,
  players: {},
  selectedIcons: [],
  invalidIcons: [],
  targetHeroes: [],
  currentHeroes: [[]],
  gameSettings: {
    gridSize: GridSizeTypes.SMALL,
    rows: gridSizes[GridSizeTypes.SMALL].rows,
    columns: gridSizes[GridSizeTypes.SMALL].cols,
    targetTotalScore: 5,
    targetRoundScore: 3,
    showTargetIcons: true,
    timeBetweenRounds: 3, // Seconds
  },
  statusText: "",
  gameStatus: GameStatus.PLAYING,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setRound: (
      state,
      action: PayloadAction<{
        round: number;
        targetHeroes: number[];
        currentHeroes: number[][];
        statusText: string;
        gameStatus: GameStatus;
      }>
    ) => {
      state.round = action.payload.round;
      state.targetHeroes = action.payload.targetHeroes;
      state.currentHeroes = action.payload.currentHeroes;
      state.selectedIcons = [];
      state.invalidIcons = [];
      state.statusText = action.payload.statusText;
      state.gameStatus = action.payload.gameStatus;
    },
    updateSelectedIcons: (
      state,
      action: PayloadAction<{
        selectedIcons: number[];
        invalidIcons: number[];
        players: Record<string, PlayerState>;
        statusText: string;
        gameStatus: GameStatus;
      }>
    ) => {
      state.selectedIcons = action.payload.selectedIcons;
      state.invalidIcons = action.payload.invalidIcons;
      state.players = action.payload.players;
      state.statusText = action.payload.statusText;
      state.gameStatus = action.payload.gameStatus;
    },
    updatePlayersList: (
      state,
      action: PayloadAction<{
        players: Record<string, PlayerState>;
      }>
    ) => {
      state.players = action.payload.players;
    },
    setCurrentHeroes: (
      state,
      action: PayloadAction<{
        currentHeroes: number[][];
      }>
    ) => {
      state.currentHeroes = action.payload.currentHeroes;
    },
    setSettings: (
      state,
      action: PayloadAction<{
        gameSettings: GameSettings;
      }>
    ) => {
      state.gameSettings = action.payload.gameSettings;
    },
  },
});

export const {
  setRound,
  updateSelectedIcons,
  updatePlayersList,
  setCurrentHeroes,
  setSettings,
} = gameSlice.actions;

export const selectRound = (state: RootState): number => state.game.round;
export const selectPlayers = (state: RootState): Record<string, PlayerState> =>
  state.game.players;
export const selectSelectedIcons = (state: RootState): number[] =>
  state.game.selectedIcons;
export const selectInvalidIcons = (state: RootState): number[] =>
  state.game.invalidIcons;
export const selectTargetHeroes = (state: RootState): number[] =>
  state.game.targetHeroes;
export const selectCurrentHeroes = (state: RootState): number[][] =>
  state.game.currentHeroes;
export const selectGameSettings = (state: RootState): GameSettings =>
  state.game.gameSettings;
export const selectTimeBetweenRounds = (state: RootState): number =>
  state.game.gameSettings.timeBetweenRounds;
export const selectStatusText = (state: RootState): string =>
  state.game.statusText;
export const selectGameStatus = (state: RootState): GameStatus =>
  state.game.gameStatus;

export default gameSlice.reducer;
