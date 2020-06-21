export enum GameStatusReducer {
  UPDATE_ROUND = "CURRENT_ROUND",
}

type IGameStatusReducer = {
  round: number;
};

type IGameStatusActions = {
  type: GameStatusReducer.UPDATE_ROUND;
  round: number;
};

export const gameStatusInitialState: IGameStatusReducer = {
  round: 0,
};

export default function gameStatusReducer(
  state: IGameStatusReducer,
  action: IGameStatusActions
): IGameStatusReducer {
  switch (action.type) {
    case GameStatusReducer.UPDATE_ROUND:
      return { ...state, round: state.round = action.round };
    default:
      throw new Error();
  }
}
