import React, { createContext, useReducer, Dispatch, useMemo } from "react";

import {
  storeReducer,
  storeInitialState,
  StoreReducer,
  StoreActions,
} from "reducer/storeReducer";
import { StorageConstants } from "utils/constants";

const StoreStateContext = createContext<StoreReducer>(storeInitialState);
const StoreDispatchContext = createContext<Dispatch<StoreActions>>(() => null);

function getStoredVolume(): number {
  let volume = 50;

  // If there is stored value for volume, validate it
  const storedVolume = localStorage.getItem(StorageConstants.VOLUME);
  if (storedVolume) {
    const storedVolumeNumber = parseInt(storedVolume);
    if (storedVolumeNumber >= 0 && storedVolumeNumber <= 100) {
      volume = storedVolumeNumber;
    }
  }

  return volume;
}

function getStoredIsDark(): boolean {
  const storedIsDark = localStorage.getItem(StorageConstants.THEME_IS_DARK);
  if (storedIsDark && storedIsDark === "true") {
    return true;
  }
  // Light theme by default
  return false;
}

// eslint-disable-next-line react/prop-types
export const StoreContextProvider: React.FC = ({ children }) => {
  useMemo(() => {
    storeInitialState.appSettings.volume = getStoredVolume();
    storeInitialState.appSettings.isDark = getStoredIsDark();
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
