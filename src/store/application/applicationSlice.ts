import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ApplicationSettings } from "models/ApplicationSettings";
import { InstallStatus } from "models/InstallStatus";
import { Modals, RegularModals } from "models/Modals";
import { PLAY_AUDIO_ACTION } from "store/middleware/middlewareConstants";
import { AppThunk, RootState } from "store/rootStore";
import { SoundEffects } from "utils/SoundEffectList";

export interface ApplicationState {
  appSettings: ApplicationSettings;
  playerName: string;
  modalToShow: Modals | null;
  modalCustomMessage: string[];
  installStatus: InstallStatus;
}

const initialState: ApplicationState = {
  appSettings: {
    volume: 30,
    isDark: true,
  },
  playerName: "",
  modalToShow: null,
  modalCustomMessage: [],
  installStatus: InstallStatus.CHECKING,
};

export const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setVolume: (state, action: PayloadAction<number>) => {
      state.appSettings.volume = action.payload;
    },
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.appSettings.isDark = action.payload;
    },
    setPlayerName: (state, action: PayloadAction<string>) => {
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
  },
});

export const {
  setVolume,
  setIsDark,
  setPlayerName,
  updateModalToShow,
  setInstallStatus,
} = applicationSlice.actions;

export const playAudio = createAction<SoundEffects>(PLAY_AUDIO_ACTION);

export const selectVolume = (state: RootState): number =>
  state.application.appSettings.volume;
export const selectIsDark = (state: RootState): boolean =>
  state.application.appSettings.isDark;
export const selectPlayerName = (state: RootState): string =>
  state.application.playerName;
export const selectModalToShow = (state: RootState): Modals | null =>
  state.application.modalToShow;
export const selectModalCustomMessage = (state: RootState): string[] =>
  state.application.modalCustomMessage;
export const selectInstallStatus = (state: RootState): InstallStatus =>
  state.application.installStatus;

export const changeName = (): AppThunk => (dispatch) => {
  dispatch(updateModalToShow({ modal: RegularModals.PLAYER_NAME_MODAL }));
};

export default applicationSlice.reducer;
