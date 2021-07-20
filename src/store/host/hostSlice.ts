import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { setSettingsAction } from "store/game/gameActions";
import { GAME_SET_SETTINGS } from "store/game/gameConstants";
import { RootState } from "store/rootStore";
import { isClient } from "utils/utilities";

import {
  addSelectedIconAction,
  hostForcefulDisconnectAction,
  hostPeerStartAction,
  hostPeerStopAction,
  modifyGameSettingsAction,
  visitLobbyPageAction,
} from "./hostActions";
import {
  HOST_PEER_FORCED_DC,
  HOST_MODIFY_SETTINGS,
  HOST_SELECT_ICON,
  HOST_VISIT_LOBBY,
  HOST_PEER_START,
  HOST_PEER_STOP,
} from "./hostConstants";

export interface HostState {
  hostID: string | null;
  isGeneratingLink: boolean;
  modifiedGameSettings: GameSettings; // Used when modifying settings
  nextRoundTimer: NodeJS.Timer | null; // Used to start the next round
}

const initialGameSettingz: GameSettings = {
  gridSize: GridSizeTypes.SMALL,
  rows: gridSizes[GridSizeTypes.SMALL].rows,
  columns: gridSizes[GridSizeTypes.SMALL].cols,
  targetTotalScore: 5,
  targetRoundScore: 3,
  showTargetIcons: true,
  timeBetweenRounds: 3, // Seconds
};

const initialState: HostState = {
  hostID: null,
  isGeneratingLink: false,
  modifiedGameSettings: initialGameSettingz,
  nextRoundTimer: null,
};

export const hostSlice = createSlice({
  name: "host",
  initialState,
  reducers: {
    setHostID: (state, action: PayloadAction<string>) => {
      state.hostID = action.payload;
      state.isGeneratingLink = false;
    },
    resetHostState: (state) => {
      state.hostID = null;
      state.isGeneratingLink = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GAME_SET_SETTINGS, (state, action) => {
        // When new game settings are set, update modified settings to be equal
        if (setSettingsAction.match(action))
          state.modifiedGameSettings = action.payload;
      })

      .addCase(HOST_VISIT_LOBBY, (state, action) => {
        // Reset the modified settings when visiting the settings page
        if (visitLobbyPageAction.match(action)) {
          state.modifiedGameSettings = action.payload;
          if (state.nextRoundTimer) clearTimeout(state.nextRoundTimer);
        }
      })
      .addCase(HOST_PEER_FORCED_DC, (state, action) => {
        if (hostForcefulDisconnectAction.match(action))
          state.isGeneratingLink = false;
      })
      .addCase(HOST_SELECT_ICON, (state, action) => {
        if (addSelectedIconAction.match(action) && action.payload)
          state.nextRoundTimer = action.payload.nextRoundTimer;
      })
      .addCase(HOST_MODIFY_SETTINGS, (state, action) => {
        if (modifyGameSettingsAction.match(action))
          state.modifiedGameSettings = action.payload;
      })

      .addCase(HOST_PEER_START, (state, action) => {
        if (hostPeerStartAction.match(action)) state.isGeneratingLink = true;
      })
      .addCase(HOST_PEER_STOP, (state, action) => {
        if (hostPeerStopAction.match(action)) {
          hostSlice.caseReducers.resetHostState(state);
        }
      });
  },
});

export const { setHostID, resetHostState } = hostSlice.actions;

export const selectHostID = (state: RootState): string | null =>
  state.host.hostID;

export const selectIsGeneratingLink = (state: RootState): boolean =>
  state.host.isGeneratingLink;

export const selectHostModifiedGameSettings = (
  state: RootState
): GameSettings => state.host.modifiedGameSettings;

export const selectNextRoundTimer = (state: RootState): NodeJS.Timer | null =>
  state.host.nextRoundTimer;

export const isSinglePlayer = (state: RootState): boolean => {
  if (state.host.hostID === null && !isClient()) {
    return true;
  }
  return false;
};

export default hostSlice.reducer;
