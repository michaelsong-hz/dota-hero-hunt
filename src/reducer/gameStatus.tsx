import { PlayerState } from "models/PlayerState";
import { heroList } from "utils/HeroList";

export enum GameStatusReducer {
  UPDATE_ROUND = "CURRENT_ROUND",
  INCREMENT_ROUND = "INCREMENT_ROUND",
  ADD_SELECTED_ICON = "ADD_SELECTED_ICON",
  UPDATE_SELECTED_ICONS = "UPDATE_SELECTED_ICONS",
  REGISTER_NEW_PLAYER = "REGISTER_NEW_PLAYER",
  UPDATE_PLAYERS_LIST = "UPDATE_PLAYERS_LIST",
  SET_CURRENT_HEROES = "SET_CURRENT_HEROES",
  UPDATE_HOST_CONNECTION_STATE = "UPDATE_HOST_CONNECTION_STATE",
}

export type IGameStatusReducer = {
  round: number;
  players: PlayerState[];
  selectedIcons: Set<number>;
  targetHeroes: Set<number>;
  currentHeroes: Array<Array<number>>;
  isConnectedToHost: boolean;
};

export type IGameStatusActions =
  | {
      type: GameStatusReducer.UPDATE_ROUND;
      round: number;
    }
  | {
      type: GameStatusReducer.INCREMENT_ROUND;
      targetHeroes: Set<number>;
      currentHeroes: number[][];
    }
  | {
      type: GameStatusReducer.ADD_SELECTED_ICON;
      selectedIcon: number;
      playerName: string;
    }
  | {
      type: GameStatusReducer.UPDATE_SELECTED_ICONS;
      selectedIcons: Set<number>;
    }
  | {
      type: GameStatusReducer.REGISTER_NEW_PLAYER;
      newPlayerName: string;
    }
  | {
      type: GameStatusReducer.UPDATE_PLAYERS_LIST;
      currentPlayers: PlayerState[];
    }
  | {
      type: GameStatusReducer.SET_CURRENT_HEROES;
      currentHeroes: number[][];
    }
  | {
      type: GameStatusReducer.UPDATE_HOST_CONNECTION_STATE;
      isConnectedToHost: boolean;
    };

export const gameStatusInitialState: IGameStatusReducer = {
  round: 0,
  players: [],
  selectedIcons: new Set(),
  targetHeroes: new Set(),
  currentHeroes: [[]],
  isConnectedToHost: false,
};

// TODO: Clean up function
function shuffle(array: number[]) {
  let i = array.length,
    j = 0,
    temp;

  while (i--) {
    j = Math.floor(Math.random() * (i + 1));

    // swap randomly chosen element with current element
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

export function gameStatusReducer(
  state: IGameStatusReducer = gameStatusInitialState,
  action: IGameStatusActions
): IGameStatusReducer {
  switch (action.type) {
    case GameStatusReducer.UPDATE_ROUND: {
      const allHeroIcons: number[] = [];
      heroList.forEach((hero, i) => {
        allHeroIcons.push(i);
      });
      // TODO: Get game settings current heroes
      const rowTarget = 16;
      const currentHeroesFlat = shuffle(allHeroIcons).slice(0, 96);
      const currentHeroes: number[][] = [];
      let currentRow: number[] = [];
      currentHeroesFlat.forEach((hero, i) => {
        currentRow.push(hero);
        if ((i + 1) % rowTarget === 0) {
          currentHeroes.push(currentRow);
          currentRow = [];
        }
      });

      // TODO: Get game settings target heroes
      const targetHeroes = new Set(shuffle(currentHeroesFlat).slice(0, 3));

      return {
        ...state,
        round: state.round = action.round,
        targetHeroes,
        currentHeroes,
        selectedIcons: new Set(),
      };
    }
    case GameStatusReducer.INCREMENT_ROUND:
      return {
        ...state,
        round: state.round + 1,
        targetHeroes: action.targetHeroes,
        currentHeroes: action.currentHeroes,
        selectedIcons: new Set(),
      };
    case GameStatusReducer.ADD_SELECTED_ICON: {
      const selectedIcons = new Set(state.selectedIcons);
      // Ignore if we have reached the target for selected icons, or the icon has
      // already been clicked this round
      // TODO: Get from game settings
      if (selectedIcons.size >= 3 || selectedIcons.has(action.selectedIcon)) {
        return state;
      }
      if (!state.targetHeroes.has(action.selectedIcon)) {
        // Do something to punish the player
        console.log("TODO: Punish the player");
        return state;
      }
      selectedIcons.add(action.selectedIcon);

      const players = [...state.players];
      players.forEach((player) => {
        if (player.name === action.playerName) {
          player.score += 1;
        }
      });
      return { ...state, selectedIcons, players };
    }
    case GameStatusReducer.UPDATE_SELECTED_ICONS:
      return { ...state, selectedIcons: action.selectedIcons };
    case GameStatusReducer.REGISTER_NEW_PLAYER: {
      const newPlayer: PlayerState = {
        name: action.newPlayerName,
        score: 0,
        isDisabled: false,
      };
      return {
        ...state,
        players: [...state.players, newPlayer],
      };
    }
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
    case GameStatusReducer.UPDATE_HOST_CONNECTION_STATE:
      return { ...state, isConnectedToHost: action.isConnectedToHost };
    default:
      return state;
  }
}
