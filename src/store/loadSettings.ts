import { captureException } from "@sentry/react";
import localForage from "localforage";

import { StorageConstants } from "utils/constants";

import { initialApplicationSettings } from "./application/applicationSlice";
import { setIsDark, setLoadedSettings } from "./application/applicationThunks";
import { initializeSettingsAsync } from "./game/gameThunks";
import { store } from "./rootStore";

function setStoredApplicationSettings(storedAppSettings: [unknown, unknown]) {
  let initializedVolume = initialApplicationSettings.volume;
  if (typeof storedAppSettings[0] === "number") {
    initializedVolume = storedAppSettings[0];
  }

  let initializedPlayerName = "";
  if (typeof storedAppSettings[1] === "string") {
    initializedPlayerName = storedAppSettings[1];
  }

  store.dispatch(setLoadedSettings(initializedVolume, initializedPlayerName));
}

async function loadStoredApplicationSettings() {
  try {
    const storedAppSettings = await Promise.all([
      localForage.getItem(StorageConstants.VOLUME),
      localForage.getItem(StorageConstants.PLAYER_NAME),
    ]);
    setStoredApplicationSettings(storedAppSettings);
  } catch (err) {
    captureException(err);
  }
}

function setStoredTheme(storedIsDark: unknown) {
  let initializedIsDark = initialApplicationSettings.isDark;

  if (typeof storedIsDark === "boolean") {
    initializedIsDark = storedIsDark;
  }

  store.dispatch(setIsDark(initializedIsDark));
}

async function loadStoredTheme() {
  try {
    const storedTheme = await localForage.getItem(
      StorageConstants.THEME_IS_DARK
    );
    setStoredTheme(storedTheme);
  } catch (err) {
    captureException(err);
  }
}

export function loadStoredSettings(): void {
  loadStoredTheme(); // Prioritize loading the stored theme first
  loadStoredApplicationSettings();
  store.dispatch(initializeSettingsAsync());
}
