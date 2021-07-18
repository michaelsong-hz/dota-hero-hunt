import {
  GameSettings,
  GridSizeTypes,
  gridSizes,
} from "models/GameSettingsType";

import { initialGameSettings } from "./gameSlice";

export function prepareStoredGameSettings(storedGameSettings: unknown): {
  gridSize: GridSizeTypes;
  rows: number;
  columns: number;
  targetTotalScore: number | null;
  targetRoundScore: number | null;
  showTargetIcons: boolean;
  timeBetweenRounds: number;
} {
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

  return initializedGameSettings;
}
