import { createAction } from "@reduxjs/toolkit";

import { PLAY_AUDIO_ACTION } from "store/middleware/middlewareConstants";
import { SoundEffects } from "utils/SoundEffectList";

import { APPLICATION_SET_PLAYER_NAME } from "./applicationConstants";

export const playAudio = createAction<SoundEffects>(PLAY_AUDIO_ACTION);

export const setPlayerName = createAction<string>(APPLICATION_SET_PLAYER_NAME);
