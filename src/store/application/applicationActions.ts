import { createAction } from "@reduxjs/toolkit";

import { PLAY_AUDIO_ACTION } from "store/middleware/middlewareConstants";
import { SoundEffects } from "utils/SoundEffectList";

import {
  APPLICATION_SET_IS_DARK,
  APPLICATION_SET_LOADED_SETTINGS,
  APPLICATION_SET_PLAYER_NAME,
  APPLICATION_SET_VOLUME,
} from "./applicationConstants";

export const playAudio = createAction<SoundEffects>(PLAY_AUDIO_ACTION);

export const setPlayerNameAction = createAction<string>(
  APPLICATION_SET_PLAYER_NAME
);

export const setVolumeAction = createAction<number>(APPLICATION_SET_VOLUME);
export const setIsDarkAction = createAction<boolean>(APPLICATION_SET_IS_DARK);
export const setLoadedSettingsAction = createAction<{
  volume: number;
  playerName: string;
}>(APPLICATION_SET_LOADED_SETTINGS);
