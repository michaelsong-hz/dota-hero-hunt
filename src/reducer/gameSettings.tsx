export enum GameSettingsReducerConstants {
  UPDATE_ROWS = "UDPATE_ROWS",
  UPDATE_COLUMNS = "UPDATE_COLUMNS",
  UPDATE_TARGET_SCORE = "UPDATE_TARGET_SCORE",
  UPDATE_SHOW_ICONS = "UPDATE_SHOW_ICONS",
}

export type IGameSettingsReducer = {
  rows: number;
  columns: number;
  targetTotalScore: number;
  targetRoundScore: number;
  showIcons: boolean;
};

export type IGameSettingsActions =
  | {
      type: GameSettingsReducerConstants.UPDATE_ROWS;
      rows: number;
    }
  | {
      type: GameSettingsReducerConstants.UPDATE_COLUMNS;
      columns: number;
    }
  | {
      type: GameSettingsReducerConstants.UPDATE_TARGET_SCORE;
      targetScore: number;
    }
  | {
      type: GameSettingsReducerConstants.UPDATE_SHOW_ICONS;
      showIcons: boolean;
    };

export const gameSettingsInitialState: IGameSettingsReducer = {
  rows: 4,
  columns: 10,
  targetTotalScore: 15,
  targetRoundScore: 3,
  showIcons: false,
};

export default function gameSettingsReducer(
  state: IGameSettingsReducer = gameSettingsInitialState,
  action: IGameSettingsActions
): IGameSettingsReducer {
  switch (action.type) {
    case GameSettingsReducerConstants.UPDATE_ROWS:
      return { ...state, rows: state.rows = action.rows };
    case GameSettingsReducerConstants.UPDATE_COLUMNS:
      state.columns = action.columns;
      return state;
    case GameSettingsReducerConstants.UPDATE_TARGET_SCORE:
      state.targetTotalScore = action.targetScore;
      return state;
    case GameSettingsReducerConstants.UPDATE_SHOW_ICONS:
      state.showIcons = action.showIcons;
      return state;
    default:
      return state;
  }
}
