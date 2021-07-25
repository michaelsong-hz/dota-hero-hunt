import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { PlayerState } from "models/PlayerState";
import { APPLICATION_RESET } from "store/application/applicationConstants";
import {
  clientIconUpdateAction,
  clientPeerConnectedAction,
  clientPeerStopAction,
} from "store/client/clientActions";
import {
  CLIENT_ICON_UPDATE,
  CLIENT_PEER_CONNECTED,
  CLIENT_PEER_STOP,
} from "store/client/clientConstants";
import {
  addSelectedIconAction,
  hostClearBoardAction,
  hostCountdownAction,
  hostPeerStartAction,
  incrementRoundAction,
  submitPlayerNameAction,
  visitLobbyPageAction,
} from "store/host/hostActions";
import {
  HOST_CLEAR_BOARD,
  HOST_COUNTDOWN_TICK,
  HOST_INCREMENT_ROUND,
  HOST_PEER_START,
  HOST_SELECT_ICON,
  HOST_SUBMIT_PLAYER_NAME,
  HOST_VISIT_LOBBY,
} from "store/host/hostConstants";
import { RootState } from "store/rootStore";

import { setSettingsAction } from "./gameActions";
import { GAME_INIT_SETTINGS, GAME_SET_SETTINGS } from "./gameConstants";
import { initializeSettingsAsync } from "./gameThunks";

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
  countdown: number; //seconds
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
  countdown: 0,
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
        players: Record<string, PlayerState>;
      }>
    ) => {
      state.round = action.payload.round;
      state.targetHeroes = action.payload.targetHeroes;
      // Don't clear the board if leaving the page as it breaks the animation
      if (action.payload.round !== 0)
        state.currentHeroes = action.payload.currentHeroes;
      state.selectedIcons = [];
      state.invalidIcons = [];
      state.statusText = action.payload.statusText;
      state.gameStatus = action.payload.gameStatus;
      state.players = action.payload.players;
    },
    updatePlayersList: (
      state,
      action: PayloadAction<{
        players: Record<string, PlayerState>;
      }>
    ) => {
      state.players = action.payload.players;
    },
    clientCountdown: (
      state,
      action: PayloadAction<{
        countdown: number;
        statusText: string;
        isFirstTick?: boolean | undefined;
      }>
    ) => {
      if (action.payload.isFirstTick === true) {
        state.round = 0;
        state.selectedIcons = [];
        state.invalidIcons = [];
        state.targetHeroes = [];
        state.currentHeroes = [[]];
        state.gameStatus = GameStatus.PLAYING_COUNTDOWN;

        for (const key in state.players) {
          state.players[key].score = 0;
        }
      }

      state.countdown = action.payload.countdown;
      state.statusText = action.payload.statusText;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GAME_SET_SETTINGS, (state, action) => {
        if (setSettingsAction.match(action))
          state.gameSettings = action.payload;
      })
      .addCase(`${GAME_INIT_SETTINGS}/fulfilled`, (state, action) => {
        if (initializeSettingsAsync.fulfilled.match(action)) {
          state.gameSettings = action.payload;
        }
      })

      .addCase(HOST_INCREMENT_ROUND, (state, action) => {
        if (incrementRoundAction.match(action)) {
          state.round = action.payload.round;
          state.targetHeroes = action.payload.targetHeroes;
          state.currentHeroes = action.payload.currentHeroes;
          state.selectedIcons = [];
          state.invalidIcons = [];
          state.statusText = action.payload.statusText;
          state.gameStatus = action.payload.gameStatus;

          // If players exist in payload (is host), set them
          if (action.payload.players) state.players = action.payload.players;
        }
      })
      .addCase(HOST_SELECT_ICON, (state, action) => {
        if (addSelectedIconAction.match(action) && action.payload) {
          state.players = action.payload.newState.players;
          state.selectedIcons = action.payload.newState.selectedIcons;
          state.invalidIcons = action.payload.newState.invalidIcons;
          state.statusText = action.payload.newState.statusText;
          state.gameStatus = action.payload.newState.gameStatus;
        }
      })
      .addCase(HOST_COUNTDOWN_TICK, (state, action) => {
        if (hostCountdownAction.match(action) && action.payload) {
          if (action.payload.isFirstTick === true) {
            state.round = 0;
            state.selectedIcons = [];
            state.invalidIcons = [];
            state.targetHeroes = [];
            state.currentHeroes = [[]];
            state.gameStatus = GameStatus.PLAYING_COUNTDOWN;

            for (const key in state.players) {
              state.players[key].score = 0;
            }
          }

          state.countdown = action.payload.countdown;
          state.statusText = action.payload.statusText;
        }
      })
      .addCase(HOST_CLEAR_BOARD, (state, action) => {
        if (hostClearBoardAction.match(action)) {
          state.selectedIcons = [];
          state.invalidIcons = [];
          state.targetHeroes = [];
          state.currentHeroes = [[]];
        }
      })
      .addCase(HOST_VISIT_LOBBY, (state, action) => {
        if (visitLobbyPageAction.match(action)) {
          state.countdown = -1;

          state.gameStatus = GameStatus.LOBBY;
        }
      })
      .addCase(HOST_SUBMIT_PLAYER_NAME, (state, action) => {
        if (submitPlayerNameAction.match(action)) {
          state.players = action.payload.players;
        }
      })
      .addCase(HOST_PEER_START, (state, action) => {
        if (hostPeerStartAction.match(action))
          state.players[action.payload] = {
            score: 0,
            isDisabled: false,
          };
      })

      .addCase(CLIENT_PEER_CONNECTED, (state, action) => {
        if (clientPeerConnectedAction.match(action)) {
          state.round = action.payload.round;
          state.players = action.payload.players;
          state.selectedIcons = action.payload.selected;
          state.invalidIcons = action.payload.invalidIcons;
          state.targetHeroes = action.payload.targetHeroes;
          state.currentHeroes = action.payload.currentHeroes;
          state.gameSettings = action.payload.settings;
          state.statusText = action.payload.statusText;
          state.gameStatus = action.payload.gameStatus;
        }
      })
      .addCase(CLIENT_PEER_STOP, (state, action) => {
        if (clientPeerStopAction.match(action)) {
          state.players = {};
          state.players[action.payload.playerName] = {
            score: 0,
            isDisabled: false,
          };
        }
      })
      .addCase(CLIENT_ICON_UPDATE, (state, action) => {
        if (clientIconUpdateAction.match(action)) {
          state.selectedIcons = action.payload.selectedIcons;
          state.invalidIcons = action.payload.invalidIcons;
          state.players = action.payload.players;
          state.statusText = action.payload.statusText;
          state.gameStatus = action.payload.gameStatus;
        }
      })

      .addCase(APPLICATION_RESET, () => {
        return initialState;
      });
  },
});

export const { setRound, updatePlayersList, clientCountdown } =
  gameSlice.actions;

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
export const selectGridRowsCols = (state: RootState): [number, number] => [
  state.game.gameSettings.rows,
  state.game.gameSettings.columns,
];
export const selectTargetTotalScore = (state: RootState): number | null =>
  state.game.gameSettings.targetTotalScore;
export const selectTimeBetweenRounds = (state: RootState): number =>
  state.game.gameSettings.timeBetweenRounds;
export const selectStatusText = (state: RootState): string =>
  state.game.statusText;
export const selectGameStatus = (state: RootState): GameStatus =>
  state.game.gameStatus;
export const selectCountdown = (state: RootState): number =>
  state.game.countdown;

export default gameSlice.reducer;
