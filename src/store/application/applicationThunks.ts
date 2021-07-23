import { captureException } from "@sentry/react";
import { Howler } from "howler";
import localForage from "localforage";

import { RegularModals } from "models/Modals";
import { initializeSettingsAsync } from "store/game/gameThunks";
import { AppDispatch, AppThunk } from "store/rootStore";
import { StorageConstants } from "utils/constants";

import {
  resetAction,
  setIsDarkAction,
  setLoadedSettingsAction,
  setVolumeAction,
} from "./applicationActions";
import {
  initialApplicationSettings,
  updateModalToShow,
} from "./applicationSlice";

function setStoredApplicationSettings(
  dispatch: AppDispatch,
  storedAppSettings: [unknown, unknown]
) {
  let initializedVolume = initialApplicationSettings.volume;
  if (typeof storedAppSettings[0] === "number") {
    initializedVolume = storedAppSettings[0];
  }

  let initializedPlayerName = "";
  if (typeof storedAppSettings[1] === "string") {
    initializedPlayerName = storedAppSettings[1];
  }

  dispatch(setLoadedSettings(initializedVolume, initializedPlayerName));
}

const loadStoredApplicationSettings = (): AppThunk => async (dispatch) => {
  try {
    const storedAppSettings = await Promise.all([
      localForage.getItem(StorageConstants.VOLUME),
      localForage.getItem(StorageConstants.PLAYER_NAME),
    ]);
    setStoredApplicationSettings(dispatch, storedAppSettings);
  } catch (err) {
    captureException(err);
  }
};

function setStoredTheme(dispatch: AppDispatch, storedIsDark: unknown) {
  let initializedIsDark = initialApplicationSettings.isDark;

  if (typeof storedIsDark === "boolean") {
    initializedIsDark = storedIsDark;
  }

  dispatch(setIsDark(initializedIsDark));
}

const loadStoredTheme = (): AppThunk => async (dispatch) => {
  try {
    const storedTheme = await localForage.getItem(
      StorageConstants.THEME_IS_DARK
    );
    setStoredTheme(dispatch, storedTheme);
  } catch (err) {
    captureException(err);
  }
};

export const loadStoredSettings = (): AppThunk => (dispatch) => {
  dispatch(loadStoredTheme()); // Prioritize loading the stored theme first
  dispatch(loadStoredApplicationSettings());
  dispatch(initializeSettingsAsync());
};

export const setVolume =
  (volume: string | number): AppThunk =>
  (dispatch) => {
    let parsedVolume;
    if (typeof volume === "string") {
      parsedVolume = parseInt(volume);
    } else {
      parsedVolume = volume;
    }
    dispatch(setVolumeAction(parsedVolume));
    Howler.volume(parsedVolume / 100);
  };

export const setIsDark =
  (isDark: boolean): AppThunk =>
  (dispatch) => {
    dispatch(setIsDarkAction(isDark));
  };

export const setLoadedSettings =
  (volume: number, playerName: string): AppThunk =>
  (dispatch) => {
    dispatch(setLoadedSettingsAction({ volume, playerName }));
    Howler.volume(volume / 100);
  };

export const changeName = (): AppThunk => (dispatch) => {
  dispatch(updateModalToShow({ modal: RegularModals.PLAYER_NAME_MODAL }));
};

export const resetApplication = (): AppThunk => (dispatch) => {
  dispatch(resetAction());
  dispatch(loadStoredSettings());
};
