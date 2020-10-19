import React, { createContext, useReducer, Dispatch, useMemo } from "react";

import {
  storeReducer,
  storeInitialState,
  StoreReducer,
  StoreActions,
} from "reducer/storeReducer";
import { StorageConstants } from "utils/constants";

export const StoreContext = createContext<{
  state: StoreReducer;
  dispatch: Dispatch<StoreActions>;
}>({ state: storeInitialState, dispatch: () => null });

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

// eslint-disable-next-line react/prop-types
export const StoreContextProvider: React.FC = ({ children }) => {
  useMemo(() => {
    storeInitialState.appSettings.volume = getStoredVolume();
    // TODO: Read from storage
    storeInitialState.appSettings.isDark = true;
  }, []);

  const [state, dispatch] = useReducer(storeReducer, storeInitialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
