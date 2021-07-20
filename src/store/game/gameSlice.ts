import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { GameStatus } from "models/GameStatus";
import { PlayerState } from "models/PlayerState";
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
  hostPeerStartAction,
  incrementRoundAction,
  submitPlayerNameAction,
  visitAboutPageAction,
  visitLobbyPageAction,
} from "store/host/hostActions";
import {
  HOST_INCREMENT_ROUND,
  HOST_PEER_START,
  HOST_SELECT_ICON,
  HOST_SUBMIT_PLAYER_NAME,
  HOST_VISIT_ABOUT,
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
        players: Record<string, PlayerState>;
      }>
    ) => {
      state.round = action.payload.round;
      state.targetHeroes = action.payload.targetHeroes;
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
      .addCase(HOST_VISIT_LOBBY, (state, action) => {
        if (visitLobbyPageAction.match(action)) {
          state.gameStatus = GameStatus.LOBBY;
          state.round = 0;
          // Clear the hero grid when visiting the settings page
          state.selectedIcons = [];
          state.invalidIcons = [];
          state.targetHeroes = [];
          state.currentHeroes = [[]];
        }
      })
      .addCase(HOST_SUBMIT_PLAYER_NAME, (state, action) => {
        if (submitPlayerNameAction.match(action)) {
          state.players = action.payload.players;
        }
      })
      .addCase(HOST_VISIT_ABOUT, (state, action) => {
        if (visitAboutPageAction.match(action)) {
          state.round = 0;
          // Clear the hero grid when visiting the about page
          state.selectedIcons = [];
          state.invalidIcons = [];
          state.targetHeroes = [];
          state.currentHeroes = [[]];
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
      });
  },
});

export const { setRound, updatePlayersList } = gameSlice.actions;

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
