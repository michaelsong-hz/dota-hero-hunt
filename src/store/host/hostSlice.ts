import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { GameSettings } from "models/GameSettingsType";
import { HostTypes } from "models/MessageHostTypes";
import { Modals } from "models/Modals";
import {
  setIsInviteLinkCopied,
  updateModalToShow,
} from "store/application/applicationSlice";
import { initialGameSettings } from "store/game/gameSlice";
import {
  PEER_HOST_BROADCAST,
  PEER_HOST_START,
  PEER_HOST_STOP,
} from "store/middleware/middlewareConstants";
import { AppThunk, RootState } from "store/rootStore";
import { getHostInviteLink, isClient } from "utils/utilities";

export interface HostState {
  hostID: string | null;
  isGeneratingLink: boolean;
  modifiedGameSettings: GameSettings; // Used when modifying settings
}

const initialState: HostState = {
  hostID: null,
  isGeneratingLink: false,
  modifiedGameSettings: initialGameSettings,
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
});

export const {
  setHostID,
  resetHostState,
  setIsGeneratingLink,
  setModifiedGameSettings,
} = hostSlice.actions;

export const startHostWS = createAction(PEER_HOST_START);
export const stopHostWS = createAction(PEER_HOST_STOP);
export const hostWSBroadcast = createAction<HostTypes>(PEER_HOST_BROADCAST);

export const selectHostID = (state: RootState): string | null =>
  state.host.hostID;

export const selectIsGeneratingLink = (state: RootState): boolean =>
  state.host.isGeneratingLink;

export const selectHostModifiedGameSettings = (
  state: RootState
): GameSettings => state.host.modifiedGameSettings;

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

// Called when the host is forcefully disconnected
// Clean up state and display error modal
export const hostForcefulDisconnect =
  (modal: Modals, message?: string[]): AppThunk =>
  (dispatch) => {
    dispatch(updateModalToShow({ modal, message }));
    dispatch(resetHostState());
  };

export default hostSlice.reducer;
