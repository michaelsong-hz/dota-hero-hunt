import { captureException } from "@sentry/react";
import localForage from "localforage";

import { ApplicationSettings } from "models/ApplicationSettings";
import {
  GameSettings,
  GridSizeTypes,
  gridSizes,
} from "models/GameSettingsType";
import { StorageConstants } from "utils/constants";

import {
  initialApplicationSettings,
  setApplicationSettings,
  setSettingsLoaded,
} from "./application/applicationSlice";
import { startGame } from "./game/gameHostThunks";
import { initialGameSettings, setSettings } from "./game/gameSlice";
import { store } from "./rootStore";

function setStoredGameSettings(storedGameSettings: unknown) {
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
      typeof (storedGameSettings as GameSettings).showTargetIcons === "boolean"
    ) {
      initializedGameSettings.showTargetIcons = (
        storedGameSettings as GameSettings
      ).showTargetIcons;
    }

    if (
      "timeBetweenRounds" in storedGameSettings &&
      typeof (storedGameSettings as GameSettings).timeBetweenRounds === "number"
    ) {
      initializedGameSettings.timeBetweenRounds = (
        storedGameSettings as GameSettings
      ).timeBetweenRounds;
    }
  }

  store.dispatch(setSettings({ gameSettings: initializedGameSettings }));
  store.dispatch(startGame());
  store.dispatch(setSettingsLoaded(true)); // Allows the game to render
}

async function loadStoredGameSettings() {
  try {
    const storedGameSettings = await localForage.getItem(
      StorageConstants.GAME_SETTINGS
    );
    setStoredGameSettings(storedGameSettings);
  } catch (err) {
    captureException(err);
  }
}

function setStoredApplicationSettings(storedAppSettings: [unknown, unknown]) {
  const initializedApplicationSettings: ApplicationSettings = {
    ...initialApplicationSettings,
  };

  if (typeof storedAppSettings[0] === "boolean") {
    initializedApplicationSettings.isDark = storedAppSettings[0];
  }

  if (typeof storedAppSettings[1] === "number") {
    initializedApplicationSettings.volume = storedAppSettings[1];
  }

  store.dispatch(setApplicationSettings(initializedApplicationSettings));
}

async function loadStoredApplicationSettings() {
  try {
    const storedAppSettings = await Promise.all([
      localForage.getItem(StorageConstants.THEME_IS_DARK),
      localForage.getItem(StorageConstants.VOLUME),
    ]);
    setStoredApplicationSettings(storedAppSettings);
  } catch (err) {
    captureException(err);
  }
}

export function loadStoredSettings(): void {
  loadStoredApplicationSettings();
  loadStoredGameSettings();
}
