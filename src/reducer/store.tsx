import { captureException } from "@sentry/react";
import { Howler } from "howler";
import React, { createContext, useReducer, Dispatch, useMemo } from "react";

import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import {
  storeReducer,
  storeInitialState,
  StoreReducer,
  StoreActions,
} from "reducer/storeReducer";
import { StorageConstants } from "utils/constants";
import { checkForSettingsErrors } from "utils/utilities";

const StoreStateContext = createContext<StoreReducer>(storeInitialState);
const StoreDispatchContext = createContext<Dispatch<StoreActions>>(() => null);

function getStoredVolume(): number {
  let volume = storeInitialState.appSettings.volume;

  // If there is stored value for volume, validate it
  const storedVolume = localStorage.getItem(StorageConstants.VOLUME);
  if (storedVolume) {
    const storedVolumeNumber = parseInt(storedVolume);
    if (storedVolumeNumber >= 0 && storedVolumeNumber <= 100) {
      volume = storedVolumeNumber;
      Howler.volume(volume / 100);
    }
  }

  return volume;
}

function getStoredIsDark(): boolean {
  const storedIsDark = localStorage.getItem(StorageConstants.THEME_IS_DARK);
  if (storedIsDark && storedIsDark === "false") {
    return false;
  }
  return true;
}

function readStoredBoolean(storedBoolean: string | null): boolean | null {
  if (storedBoolean === "true") {
    return true;
  } else if (storedBoolean === "false") {
    return false;
  }
  return null;
}

function getStoredGameSettings(): GameSettings {
  const gameSettings = { ...storeInitialState.gameSettings };

  const storedGameSettingsRaw = localStorage.getItem(
    StorageConstants.GAME_SETTINGS
  );
  if (storedGameSettingsRaw !== null && storedGameSettingsRaw !== undefined) {
    try {
      const storedGameSettings = JSON.parse(storedGameSettingsRaw);

      // Show Icon to Search For
      const showTargetIcons = readStoredBoolean(
        storedGameSettings.showTargetIcons
      );
      if (showTargetIcons !== null) {
        gameSettings.showTargetIcons = showTargetIcons;
      }

      // Grid Size
      const storedGridSize = storedGameSettings.gridSize;
      if (storedGridSize !== null || storedGridSize !== undefined) {
        const selectedNumber = parseInt(storedGridSize);
        if (selectedNumber in GridSizeTypes) {
          const gridSizeType: GridSizeTypes = selectedNumber;
          gameSettings.gridSize = selectedNumber;
          gameSettings.rows = gridSizes[gridSizeType].rows;
          gameSettings.columns = gridSizes[gridSizeType].cols;
        }
      }

      // Points To Win
      const storedTargetTotalScore = storedGameSettings.targetTotalScore;
      if (storedTargetTotalScore !== undefined) {
        if (storedTargetTotalScore === null) {
          gameSettings.targetTotalScore = null;
        } else {
          gameSettings.targetTotalScore = parseInt(storedTargetTotalScore);
        }
      }

      // Points to Advance Round
      const storedTargetRoundScore = storedGameSettings.targetRoundScore;
      if (storedTargetRoundScore !== undefined) {
        if (storedTargetRoundScore === null) {
          gameSettings.targetRoundScore = null;
        } else {
          gameSettings.targetRoundScore = parseInt(storedTargetRoundScore);
        }
      }
    } catch (e) {
      captureException(e);
    }

    // Reject the read game settings if they fail to validate
    if (checkForSettingsErrors(gameSettings).length > 0) {
      captureException(
        new Error(`Read invalid settings: ${JSON.stringify(gameSettings)}`)
      );
      return { ...storeInitialState.gameSettings };
    }
  }

  return gameSettings;
}

// eslint-disable-next-line react/prop-types
export const StoreContextProvider: React.FC = ({ children }) => {
  useMemo(() => {
    storeInitialState.appSettings.volume = getStoredVolume();
    storeInitialState.appSettings.isDark = getStoredIsDark();
    storeInitialState.gameSettings = getStoredGameSettings();
  }, []);

  const [state, dispatch] = useReducer(storeReducer, storeInitialState);
  return (
    <StoreStateContext.Provider value={state}>
      <StoreDispatchContext.Provider value={dispatch}>
        {children}
      </StoreDispatchContext.Provider>
    </StoreStateContext.Provider>
  );
};

export function useStoreState(): StoreReducer {
  const context = React.useContext(StoreStateContext);
  if (context === undefined) {
    throw new Error("useStoreState must be used within a StoreProvider");
  }
  return context;
}

export function useStoreDispatch(): React.Dispatch<StoreActions> {
  const context = React.useContext(StoreDispatchContext);
  if (context === undefined) {
    throw new Error("useStoreDispatch must be used within a StoreProvider");
  }
  return context;
}
