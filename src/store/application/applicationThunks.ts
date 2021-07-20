import { Howler } from "howler";

import { RegularModals } from "models/Modals";
import { AppThunk } from "store/rootStore";

import {
  setIsDarkAction,
  setLoadedSettingsAction,
  setVolumeAction,
} from "./applicationActions";
import { updateModalToShow } from "./applicationSlice";

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
