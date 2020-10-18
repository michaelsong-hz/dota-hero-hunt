import { PlayerState } from "models/PlayerState";

export enum GameStatusReducer {
  UPDATE_ROUND = "UPDATE_ROUND",
  UPDATE_SELECTED_ICONS = "UPDATE_SELECTED_ICONS",
  UPDATE_PLAYERS_LIST = "UPDATE_PLAYERS_LIST",
  SET_CURRENT_HEROES = "SET_CURRENT_HEROES",
}

export type IGameStatusReducer = {
  round: number;
  players: PlayerState[];
  selectedIcons: Set<number>;
  targetHeroes: Set<number>;
  currentHeroes: Array<Array<number>>;
};

export type IGameStatusActions =
  | {
      type: GameStatusReducer.UPDATE_ROUND;
      round: number;
      targetHeroes: Set<number>;
      currentHeroes: number[][];
    }
  | {
      type: GameStatusReducer.UPDATE_SELECTED_ICONS;
      selectedIcons: Set<number>;
    }
  | {
      type: GameStatusReducer.UPDATE_PLAYERS_LIST;
      currentPlayers: PlayerState[];
    }
  | {
      type: GameStatusReducer.SET_CURRENT_HEROES;
      currentHeroes: number[][];
    };

export const gameStatusInitialState: IGameStatusReducer = {
  round: 0,
  players: [],
  selectedIcons: new Set(),
  targetHeroes: new Set(),
  currentHeroes: [[]],
};

export function gameStatusReducer(
  state: IGameStatusReducer = gameStatusInitialState,
  action: IGameStatusActions
): IGameStatusReducer {
  switch (action.type) {
    case GameStatusReducer.UPDATE_ROUND:
      return {
        ...state,
        round: action.round,
        targetHeroes: action.targetHeroes,
        currentHeroes: action.currentHeroes,
        selectedIcons: new Set(),
      };
    case GameStatusReducer.UPDATE_SELECTED_ICONS:
      return { ...state, selectedIcons: action.selectedIcons };
    case GameStatusReducer.UPDATE_PLAYERS_LIST: {
      return {
        ...state,
        players: action.currentPlayers,
      };
    }
    case GameStatusReducer.SET_CURRENT_HEROES:
      return {
        ...state,
        currentHeroes: action.currentHeroes,
      };
    default:
      return state;
  }
}
