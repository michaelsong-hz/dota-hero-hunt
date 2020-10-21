export enum GridSizeTypes {
  SMALL,
  MEDIUM,
  LARGE,
  CUSTOM,
}

type GridSizes = Record<GridSizeTypes, { rows: number; cols: number }>;

export const gridSizes: GridSizes = {
  [GridSizeTypes.SMALL]: { rows: 4, cols: 4 },
  [GridSizeTypes.MEDIUM]: { rows: 6, cols: 8 },
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
