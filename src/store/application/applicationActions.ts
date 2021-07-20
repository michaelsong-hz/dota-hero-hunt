import { createAction } from "@reduxjs/toolkit";

import {
  APPLICATION_SET_IS_DARK,
  APPLICATION_SET_LOADED_SETTINGS,
  APPLICATION_SET_VOLUME,
} from "./applicationConstants";

export const setVolumeAction = createAction<number>(APPLICATION_SET_VOLUME);
export const setIsDarkAction = createAction<boolean>(APPLICATION_SET_IS_DARK);
export const setLoadedSettingsAction = createAction<{
  volume: number;
  playerName: string;
}>(APPLICATION_SET_LOADED_SETTINGS);
