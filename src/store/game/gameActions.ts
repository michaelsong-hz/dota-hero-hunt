import { createAction } from "@reduxjs/toolkit";

import { GameSettings } from "models/GameSettingsType";

import { GAME_SET_SETTINGS } from "./gameConstants";

export const setSettingsAction = createAction<GameSettings>(GAME_SET_SETTINGS);
