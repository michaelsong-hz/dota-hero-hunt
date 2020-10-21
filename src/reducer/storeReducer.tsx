import { ApplicationSettings } from "models/ApplicationSettings";
import { GameSettings, GridSizeTypes } from "models/GameSettingsType";
import { PlayerState } from "models/PlayerState";

export enum StoreConstants {
  UPDATE_ROUND,
  UPDATE_SELECTED_ICONS,
  UPDATE_PLAYERS_LIST,
  SET_CURRENT_HEROES,
  SET_SETTINGS,
  SET_VOLUME,
  SET_THEME,
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
    };

export const storeInitialState: StoreReducer = {
  round: 0,
  players: {},
  selectedIcons: new Set(),
  invalidIcons: new Set(),
  targetHeroes: new Set(),
  currentHeroes: [[]],
  gameSettings: {
    gridSize: GridSizeTypes.LARGE,
    rows: 6,
    columns: 16,
    targetTotalScore: 15,
    targetRoundScore: 3,
    showTargetIcons: false,
  },
  appSettings: {
    volume: 0,
    isDark: true,
  },
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
    default:
      return state;
  }
}
