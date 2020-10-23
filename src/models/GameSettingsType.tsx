export enum GridSizeTypes {
  SMALL,
  MEDIUM,
  LARGE,
  LARGE_SQUARE,
  CUSTOM,
}

type GridSizes = Record<GridSizeTypes, { rows: number; cols: number }>;

export const gridSizes: GridSizes = {
  [GridSizeTypes.SMALL]: { rows: 5, cols: 6 },
  [GridSizeTypes.MEDIUM]: { rows: 7, cols: 7 },
  [GridSizeTypes.LARGE_SQUARE]: { rows: 9, cols: 11 },
  [GridSizeTypes.LARGE]: { rows: 6, cols: 16 },
  [GridSizeTypes.CUSTOM]: { rows: 0, cols: 0 },
};

export type GameSettings = {
  gridSize: GridSizeTypes;
  rows: number;
  columns: number;
  targetTotalScore: number | null;
  targetRoundScore: number;
  showTargetIcons: boolean;
};
