import { createAsyncThunk } from "@reduxjs/toolkit";
import localForage from "localforage";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { AppThunk } from "store/rootStore";
import { StorageConstants } from "utils/constants";

import { setSettingsAction } from "./gameActions";
import { GAME_INIT_SETTINGS } from "./gameConstants";
import { initialGameSettings } from "./gameSlice";

export const setSettings =
  (gameSettings: GameSettings): AppThunk =>
  (dispatch) => {
    dispatch(setSettingsAction(gameSettings));
  };

export const initializeSettingsAsync = createAsyncThunk(
  GAME_INIT_SETTINGS,
  async () => {
    const storedGameSettings = await localForage.getItem(
      StorageConstants.GAME_SETTINGS
    );

    const initializedGameSettings = { ...initialGameSettings };

    if (typeof storedGameSettings === "object" && storedGameSettings !== null) {
      if (
        "gridSize" in storedGameSettings &&
        typeof (storedGameSettings as GameSettings).gridSize === "number" &&
        (storedGameSettings as GameSettings).gridSize in GridSizeTypes
      ) {
        const gridSize = (storedGameSettings as GameSettings).gridSize;
        initializedGameSettings.gridSize = gridSize;
        initializedGameSettings.rows = gridSizes[gridSize].rows;
        initializedGameSettings.columns = gridSizes[gridSize].cols;
      }

      // Skip checking rows/cols for now as we do not read them

      if (
        ("targetTotalScore" in storedGameSettings &&
          typeof (storedGameSettings as GameSettings).targetTotalScore ===
            "number") ||
        (storedGameSettings as GameSettings).targetTotalScore === null
      ) {
        initializedGameSettings.targetTotalScore = (
          storedGameSettings as GameSettings
        ).targetTotalScore;
      }

      if (
        ("targetRoundScore" in storedGameSettings &&
          typeof (storedGameSettings as GameSettings).targetRoundScore ===
            "number") ||
        (storedGameSettings as GameSettings).targetRoundScore === null
      ) {
        initializedGameSettings.targetRoundScore = (
          storedGameSettings as GameSettings
        ).targetRoundScore;
      }

      if (
        "showTargetIcon" in storedGameSettings ||
        typeof (storedGameSettings as GameSettings).showTargetIcons ===
          "boolean"
      ) {
        initializedGameSettings.showTargetIcons = (
          storedGameSettings as GameSettings
        ).showTargetIcons;
      }

      if (
        "timeBetweenRounds" in storedGameSettings &&
        typeof (storedGameSettings as GameSettings).timeBetweenRounds ===
          "number"
      ) {
        initializedGameSettings.timeBetweenRounds = (
          storedGameSettings as GameSettings
        ).timeBetweenRounds;
      }
    }

    return initializedGameSettings;
  }
);
