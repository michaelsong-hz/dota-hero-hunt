export enum GameSettingsReducerConstants {
  UPDATE_ROWS = "UDPATE_ROWS",
  UPDATE_COLUMNS = "UPDATE_COLUMNS",
  UPDATE_TARGET_SCORE = "UPDATE_TARGET_SCORE",
  UPDATE_SHOW_ICONS = "UPDATE_SHOW_ICONS",
}

export type GameSettingsReducer = {
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

// These settings are not used for the inital state - see storeReducer.tsx
export const gameSettingsInitialState: GameSettingsReducer = {
  rows: 0,
  columns: 0,
  targetTotalScore: 0,
  targetRoundScore: 0,
  showIcons: false,
};

export default function gameSettingsReducer(
  state: GameSettingsReducer = gameSettingsInitialState,
  action: IGameSettingsActions
): GameSettingsReducer {
  switch (action.type) {
    case GameSettingsReducerConstants.UPDATE_ROWS:
      return { ...state, rows: (state.rows = action.rows) };
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
