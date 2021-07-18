import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { PlayerState } from "models/PlayerState";
import { selectPlayerName } from "store/application/applicationSlice";
import {
  addSelectedIcon,
  incrementRound,
  startHostWS,
  submitPlayerNameAction,
  visitSettingsPage,
} from "store/host/hostActions";
import {
  HOST_INCREMENT_ROUND,
  HOST_SELECT_ICON,
  HOST_SUBMIT_PLAYER_NAME,
  HOST_VISIT_SETTINGS,
} from "store/host/hostConstants";
import { PEER_HOST_START } from "store/middleware/middlewareConstants";
import { AppThunk, RootState } from "store/rootStore";

import { initializeSettingsAsync, setSettings } from "./gameActions";
import { GAME_INIT_SETTINGS, GAME_SET_SETTINGS } from "./gameConstants";

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
  statusText: string;
  gameStatus: GameStatus;
}

export const initialGameSettings: GameSettings = {
  gridSize: GridSizeTypes.SMALL,
  rows: gridSizes[GridSizeTypes.SMALL].rows,
  columns: gridSizes[GridSizeTypes.SMALL].cols,
  targetTotalScore: 5,
  targetRoundScore: 3,
  showTargetIcons: true,
  timeBetweenRounds: 3, // Seconds
};

const initialState: GameState = {
  round: 0,
  players: {},
  selectedIcons: [],
  invalidIcons: [],
  targetHeroes: [],
  currentHeroes: [[]],
  gameSettings: initialGameSettings,
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
    clearHeroGrid: (state) => {
      state.selectedIcons = [];
      state.invalidIcons = [];
      state.targetHeroes = [];
      state.currentHeroes = [[]];
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
    _setSettings: (
      state,
      action: PayloadAction<{
        gameSettings: GameSettings;
      }>
    ) => {
      state.gameSettings = action.payload.gameSettings;
    },
    setGameStatus: (state, action: PayloadAction<GameStatus>) => {
      state.gameStatus = action.payload;
    },
    resetPlayersToName: (state, action: PayloadAction<string>) => {
      state.players = {};
      state.players[action.payload] = {
        score: 0,
        isDisabled: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GAME_SET_SETTINGS, (state, action) => {
        if (setSettings.match(action))
          state.gameSettings = action.payload.gameSettings;
      })
      .addCase(GAME_INIT_SETTINGS, (state, action) => {
        if (initializeSettingsAsync.fulfilled.match(action))
          state.gameSettings = action.payload;
      })
      .addCase(HOST_INCREMENT_ROUND, (state, action) => {
        if (incrementRound.match(action)) {
          // Ensure host is in players list when starting a new game
          if (action.payload.round === 1)
            state.players[action.payload.playerName] = {
              score: 0,
              isDisabled: false,
            };

          state.round = action.payload.round;
          state.targetHeroes = action.payload.targetHeroes;
          state.currentHeroes = action.payload.currentHeroes;
          state.selectedIcons = [];
          state.invalidIcons = [];
          state.statusText = action.payload.statusText;
          state.gameStatus = action.payload.gameStatus;
        }
      })
      .addCase(HOST_SELECT_ICON, (state, action) => {
        if (addSelectedIcon.match(action) && action.payload) {
          state.players = action.payload.newState.players;
          state.selectedIcons = action.payload.newState.selectedIcons;
          state.invalidIcons = action.payload.newState.invalidIcons;
          state.statusText = action.payload.newState.statusText;
          state.gameStatus = action.payload.newState.gameStatus;
        }
      })
      .addCase(HOST_VISIT_SETTINGS, (state, action) => {
        if (visitSettingsPage.match(action)) {
          state.gameStatus = GameStatus.SETTINGS;
          // Clear the hero grid when visiting the settings page
          state.selectedIcons = [];
          state.invalidIcons = [];
          state.targetHeroes = [];
          state.currentHeroes = [[]];
          // If players exist in payload (is host), set them
          if (action.payload.players) state.players = action.payload.players;
        }
      })
      .addCase(HOST_SUBMIT_PLAYER_NAME, (state, action) => {
        if (submitPlayerNameAction.match(action)) {
          state.players = action.payload.players;
        }
      })
      .addCase(PEER_HOST_START, (state, action) => {
        if (startHostWS.match(action))
          state.players[action.payload] = {
            score: 0,
            isDisabled: false,
          };
      });
  },
});

export const {
  setRound,
  updateSelectedIcons,
  clearHeroGrid,
  updatePlayersList,
  setCurrentHeroes,
  _setSettings,
  setGameStatus,
  resetPlayersToName,
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

export const resetPlayers = (): AppThunk => (dispatch, getState) => {
  dispatch(resetPlayersToName(selectPlayerName(getState())));
};

export default gameSlice.reducer;
