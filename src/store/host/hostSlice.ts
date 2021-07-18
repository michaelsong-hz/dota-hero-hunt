import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { setIsInviteLinkCopied } from "store/application/applicationSlice";
import { setSettingsAction } from "store/game/gameActions";
import { GAME_SET_SETTINGS } from "store/game/gameConstants";
import { AppThunk, RootState } from "store/rootStore";
import { getHostInviteLink, isClient } from "utils/utilities";

import {
  addSelectedIconAction,
  hostForcefulDisconnectAction,
  hostPeerStartAction,
  hostPeerStopAction,
  modifyGameSettingsAction,
  visitSettingsPageAction,
} from "./hostActions";
import {
  HOST_PEER_FORCED_DC,
  HOST_MODIFY_SETTINGS,
  HOST_SELECT_ICON,
  HOST_VISIT_SETTINGS,
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
    setIsGeneratingLink: (state, action: PayloadAction<boolean>) => {
      state.isGeneratingLink = action.payload;
    },
    setModifiedGameSettings: (state, action: PayloadAction<GameSettings>) => {
      state.modifiedGameSettings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(HOST_VISIT_SETTINGS, (state, action) => {
        // Reset the modified settings when visiting the settings page
        if (visitSettingsPageAction.match(action)) {
          state.modifiedGameSettings = action.payload.settings;
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
      })

      .addCase(GAME_SET_SETTINGS, (state, action) => {
        // When new game settings are set, update modified settings to be equal
        if (setSettingsAction.match(action))
          state.modifiedGameSettings = action.payload;
      });
  },
});

export const {
  setHostID,
  resetHostState,
  setIsGeneratingLink,
  setModifiedGameSettings,
} = hostSlice.actions;

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

export const setHostIDAndCopyLink =
  (hostID: string): AppThunk =>
  async (dispatch) => {
    dispatch(setHostID(hostID));
    try {
      await navigator.clipboard.writeText(getHostInviteLink(hostID));
      dispatch(setIsInviteLinkCopied(true));
    } catch (err) {
      /* 😡 SAFARI won't let you copy text to the clipboard if "it's not a
        user action" and this technically isn't tied to a user action as we have
        to wait for the invite link to come back from the server before writing
        it to the clipboard THANKS TIM APPLE 🤡
        It works if you hit copy after the link is generated because then it's
        tied to a "user action" */
    }
  };

// // Called when the host is forcefully disconnected
// // Clean up state and display error modal
// export const hostForcefulDisconnect =
//   (modal: Modals, message?: string[]): AppThunk =>
//   (dispatch) => {
//     dispatch(updateModalToShow({ modal, message }));
//     dispatch(resetHostState());
//   };

export default hostSlice.reducer;
