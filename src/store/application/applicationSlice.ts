import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ApplicationSettings } from "models/ApplicationSettings";
import { InstallStatus } from "models/InstallStatus";
import { Modals, RegularModals } from "models/Modals";
import { clientNameChangeAction } from "store/client/clientActions";
import { CLIENT_NAME_CHANGE } from "store/client/clientConstants";
import { initializeSettingsAsync } from "store/game/gameThunks";
import {
  hostForcefulDisconnectAction,
  submitPlayerNameAction,
} from "store/host/hostActions";
import {
  HOST_PEER_FORCED_DC,
  HOST_PEER_STOP,
  HOST_SUBMIT_PLAYER_NAME,
  HOST_VISIT_SETTINGS,
} from "store/host/hostConstants";
import { AppThunk, RootState } from "store/rootStore";

import {
  setIsDarkAction,
  setLoadedSettingsAction,
  setPlayerNameAction,
  setVolumeAction,
} from "./applicationActions";
import {
  APPLICATION_SET_IS_DARK,
  APPLICATION_SET_LOADED_SETTINGS,
  APPLICATION_SET_PLAYER_NAME,
  APPLICATION_SET_VOLUME,
} from "./applicationConstants";

export interface ApplicationState {
  appSettings: ApplicationSettings;
  settingsLoaded: boolean;
  playerName: string;
  modalToShow: Modals | null;
  modalCustomMessage: string[];
  installStatus: InstallStatus;
  isInviteLinkCopied: boolean;
}

export const initialApplicationSettings: ApplicationSettings = {
  volume: 30,
  isDark: true,
};

const initialState: ApplicationState = {
  appSettings: initialApplicationSettings,
  settingsLoaded: false,
  playerName: "",
  modalToShow: null,
  modalCustomMessage: [],
  installStatus: InstallStatus.CHECKING,
  isInviteLinkCopied: false,
};

export const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setVolume: (state, action: PayloadAction<number>) => {
      state.appSettings.volume = action.payload;
    },

    setSettingsLoaded: (state, action: PayloadAction<boolean>) => {
      state.settingsLoaded = action.payload;
    },
    _setPlayerName: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
    },
    updateModalToShow: (
      state,
      action: PayloadAction<{ modal: Modals | null; message?: string[] }>
    ) => {
      if (action.payload.modal === null) {
        state.modalToShow = null;
        state.modalCustomMessage = [];
      } else {
        state.modalToShow = action.payload.modal;
        state.modalCustomMessage = action.payload.message
          ? action.payload.message
          : [];
      }
    },
    setInstallStatus: (state, action: PayloadAction<InstallStatus>) => {
      state.installStatus = action.payload;
    },
    setIsInviteLinkCopied: (state, action: PayloadAction<boolean>) => {
      state.isInviteLinkCopied = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeSettingsAsync.pending, (state) => {
        state.settingsLoaded = false;
      })
      .addCase(initializeSettingsAsync.fulfilled, (state) => {
        state.settingsLoaded = true;
      })

      .addCase(HOST_PEER_FORCED_DC, (state, action) => {
        if (hostForcefulDisconnectAction.match(action)) {
          state.modalToShow = action.payload.modal;
          if (action.payload.message)
            state.modalCustomMessage = action.payload.message;
        }
      })
      .addCase(HOST_SUBMIT_PLAYER_NAME, (state, action) => {
        if (submitPlayerNameAction.match(action)) {
          state.playerName = action.payload.playerName;
        }
      })
      .addCase(HOST_PEER_STOP, (state) => {
        state.isInviteLinkCopied = false;
      })
      .addCase(HOST_VISIT_SETTINGS, (state) => {
        state.isInviteLinkCopied = false;
      })

      .addCase(CLIENT_NAME_CHANGE, (state, action) => {
        if (clientNameChangeAction.match(action))
          state.playerName = action.payload;
      })
      .addCase(APPLICATION_SET_PLAYER_NAME, (state, action) => {
        if (setPlayerNameAction.match(action))
          state.playerName = action.payload;
      })
      .addCase(APPLICATION_SET_VOLUME, (state, action) => {
        if (setVolumeAction.match(action))
          state.appSettings.volume = action.payload;
      })
      .addCase(APPLICATION_SET_IS_DARK, (state, action) => {
        if (setIsDarkAction.match(action))
          state.appSettings.isDark = action.payload;
      })
      .addCase(APPLICATION_SET_LOADED_SETTINGS, (state, action) => {
        if (setLoadedSettingsAction.match(action)) {
          state.appSettings.volume = action.payload.volume;
          state.playerName = action.payload.playerName;
        }
      });
  },
});

export const {
  setSettingsLoaded,
  updateModalToShow,
  setInstallStatus,
  setIsInviteLinkCopied,
} = applicationSlice.actions;

export const selectVolume = (state: RootState): number =>
  state.application.appSettings.volume;
export const selectIsDark = (state: RootState): boolean =>
  state.application.appSettings.isDark;
export const selectSettingsLoaded = (state: RootState): boolean =>
  state.application.settingsLoaded;
export const selectPlayerName = (state: RootState): string =>
  state.application.playerName;
export const selectModalToShow = (state: RootState): Modals | null =>
  state.application.modalToShow;
export const selectModalCustomMessage = (state: RootState): string[] =>
  state.application.modalCustomMessage;
export const selectInstallStatus = (state: RootState): InstallStatus =>
  state.application.installStatus;
export const selectIsInviteLinkCopied = (state: RootState): boolean =>
  state.application.isInviteLinkCopied;

export const changeName = (): AppThunk => (dispatch) => {
  dispatch(updateModalToShow({ modal: RegularModals.PLAYER_NAME_MODAL }));
};

export default applicationSlice.reducer;
