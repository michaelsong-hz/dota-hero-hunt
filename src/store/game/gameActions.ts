import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import localForage from "localforage";

import { GameSettings } from "models/GameSettingsType";
import { StorageConstants } from "utils/constants";

import { GAME_INIT_SETTINGS, GAME_SET_SETTINGS } from "./gameConstants";
import { prepareStoredGameSettings } from "./gameHelpers";

export const setSettings =
  createAction<{ gameSettings: GameSettings }>(GAME_SET_SETTINGS);

export const initializeSettingsAsync = createAsyncThunk(
  GAME_INIT_SETTINGS,
  async () => {
    const storedGameSettings = await localForage.getItem(
      StorageConstants.GAME_SETTINGS
    );
    return prepareStoredGameSettings(storedGameSettings);
  }
);
