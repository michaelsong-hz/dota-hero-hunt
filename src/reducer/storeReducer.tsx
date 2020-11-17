import { captureException, captureMessage } from "@sentry/react";

import { ApplicationSettings } from "models/ApplicationSettings";
import {
  GameSettings,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { Modals, OtherErrorTypes } from "models/Modals";
import { PeerError, PeerJSErrorTypes } from "models/PeerErrors";
import { PlayerState } from "models/PlayerState";

export enum StoreConstants {
  UPDATE_ROUND,
  UPDATE_SELECTED_ICONS,
  UPDATE_PLAYERS_LIST,
  SET_CURRENT_HEROES,
  SET_SETTINGS,
  SET_VOLUME,
  SET_THEME,
  SET_PEER_ERROR,
  SET_MODAL,
}

export type StoreReducer = {
  round: number;
  players: Record<string, PlayerState>;
  selectedIcons: Set<number>;
  invalidIcons: Set<number>;
  targetHeroes: Set<number>;
  currentHeroes: Array<Array<number>>;
  gameSettings: GameSettings;
  appSettings: ApplicationSettings;
  modalToShow: Modals | null;
};

export type StoreActions =
  | {
      type: StoreConstants.UPDATE_ROUND;
      round: number;
      targetHeroes: Set<number>;
      currentHeroes: number[][];
    }
  | {
      type: StoreConstants.UPDATE_SELECTED_ICONS;
      selectedIcons: Set<number>;
      invalidIcons: Set<number>;
      currentPlayers: Record<string, PlayerState>;
    }
  | {
      type: StoreConstants.UPDATE_PLAYERS_LIST;
      currentPlayers: Record<string, PlayerState>;
    }
  | {
      type: StoreConstants.SET_CURRENT_HEROES;
      currentHeroes: number[][];
    }
  | {
      type: StoreConstants.SET_SETTINGS;
      gameSettings: GameSettings;
    }
  | {
      type: StoreConstants.SET_VOLUME;
      volume: number;
    }
  | {
      type: StoreConstants.SET_THEME;
      isDark: boolean;
    }
  | {
      type: StoreConstants.SET_PEER_ERROR;
      error: PeerError;
    }
  | {
      type: StoreConstants.SET_MODAL;
      modal: OtherErrorTypes | null;
    };

export const storeInitialState: StoreReducer = {
  round: 0,
  players: {},
  selectedIcons: new Set(),
  invalidIcons: new Set(),
  targetHeroes: new Set(),
  currentHeroes: [[]],
  gameSettings: {
    gridSize: GridSizeTypes.MEDIUM,
    rows: gridSizes[GridSizeTypes.MEDIUM].rows,
    columns: gridSizes[GridSizeTypes.MEDIUM].cols,
    targetTotalScore: 15,
    targetRoundScore: 3,
    showTargetIcons: true,
  },
  appSettings: {
    volume: 30,
    isDark: true,
  },
  modalToShow: null,
};

export function storeReducer(
  state: StoreReducer = storeInitialState,
  action: StoreActions
): StoreReducer {
  switch (action.type) {
    case StoreConstants.UPDATE_ROUND:
      return {
        ...state,
        round: action.round,
        targetHeroes: action.targetHeroes,
        currentHeroes: action.currentHeroes,
        selectedIcons: new Set(),
        invalidIcons: new Set(),
      };
    case StoreConstants.UPDATE_SELECTED_ICONS:
      return {
        ...state,
        selectedIcons: action.selectedIcons,
        invalidIcons: action.invalidIcons,
        players: action.currentPlayers,
      };
    case StoreConstants.UPDATE_PLAYERS_LIST: {
      return {
        ...state,
        players: action.currentPlayers,
      };
    }
    case StoreConstants.SET_CURRENT_HEROES:
      return {
        ...state,
        currentHeroes: action.currentHeroes,
      };
    case StoreConstants.SET_SETTINGS:
      return {
        ...state,
        gameSettings: action.gameSettings,
      };
    case StoreConstants.SET_VOLUME: {
      const applicationSettings = { ...state.appSettings };
      applicationSettings.volume = action.volume;
      return {
        ...state,
        appSettings: applicationSettings,
      };
    }
    case StoreConstants.SET_THEME: {
      const applicationSettings = { ...state.appSettings };
      applicationSettings.isDark = action.isDark;
      return {
        ...state,
        appSettings: applicationSettings,
      };
    }
    case StoreConstants.SET_PEER_ERROR: {
      if (Object.values(PeerJSErrorTypes).includes(action.error.type)) {
        return {
          ...state,
          modalToShow: action.error.type,
        };
      }
      console.log("Unknown error encountered", action.error);
      captureException(action.error);
      return {
        ...state,
        modalToShow: OtherErrorTypes.GENERIC_ERROR,
      };
    }
    case StoreConstants.SET_MODAL: {
      if (action.modal === null) {
        return {
          ...state,
          modalToShow: null,
        };
      } else if (Object.values(OtherErrorTypes).includes(action.modal)) {
        return {
          ...state,
          modalToShow: action.modal,
        };
      }
      console.log("Unknown modal encountered", action.modal);
      captureMessage("Tried to show an unknown modal.");
      return {
        ...state,
        modalToShow: OtherErrorTypes.GENERIC_ERROR,
      };
    }
    default:
      return state;
  }
}
