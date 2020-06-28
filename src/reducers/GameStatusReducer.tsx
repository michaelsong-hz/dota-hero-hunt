export enum GameStatusReducer {
  UPDATE_ROUND = "CURRENT_ROUND",
  INCREMENT_ROUND = "INCREMENT_ROUND",
  REGISTER_NEW_PLAYER = "REGISTER_NEW_PLAYER",
  UPDATE_HOST_CONNECTION_STATE = "UPDATE_HOST_CONNECTION_STATE",
}

type IGameStatusReducer = {
  round: number;
  players: IPlayerState[];
  isConnectedToHost: boolean;
};

type IGameStatusActions =
  | {
      type: GameStatusReducer.UPDATE_ROUND;
      round: number;
    }
  | {
      type: GameStatusReducer.INCREMENT_ROUND;
    }
  | {
      type: GameStatusReducer.REGISTER_NEW_PLAYER;
      newPlayerName: string;
    }
  | {
      type: GameStatusReducer.UPDATE_HOST_CONNECTION_STATE;
      isConnectedToHost: boolean;
    };

export const gameStatusInitialState: IGameStatusReducer = {
  round: 0,
  players: [],
  isConnectedToHost: false,
};

export default function gameStatusReducer(
  state: IGameStatusReducer,
  action: IGameStatusActions
): IGameStatusReducer {
  switch (action.type) {
    case GameStatusReducer.UPDATE_ROUND:
      return { ...state, round: state.round = action.round };
    case GameStatusReducer.INCREMENT_ROUND:
      return { ...state, round: state.round + 1 };
    case GameStatusReducer.REGISTER_NEW_PLAYER: {
      const newPlayer: IPlayerState = {
        name: action.newPlayerName,
        score: 0,
        isDisabled: false,
      };
      return {
        ...state,
        players: [...state.players, newPlayer],
      };
    }
    case GameStatusReducer.UPDATE_HOST_CONNECTION_STATE:
      return { ...state, isConnectedToHost: action.isConnectedToHost };
    default:
      throw new Error();
  }
}

interface IPlayerState {
  name: string;
  score: number;
  isDisabled: boolean;
}
