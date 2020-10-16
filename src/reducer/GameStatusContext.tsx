import React, { createContext, useReducer, Dispatch } from "react";

import {
  gameStatusReducer,
  gameStatusInitialState,
  IGameStatusReducer,
  IGameStatusActions,
} from "reducer/gameStatus";

export const GameStatusContext = createContext<{
  state: IGameStatusReducer;
  dispatch: Dispatch<IGameStatusActions>;
}>({ state: gameStatusInitialState, dispatch: () => null });

// eslint-disable-next-line react/prop-types
export const GameStatusProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    gameStatusReducer,
    gameStatusInitialState
  );
  return (
    <GameStatusContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStatusContext.Provider>
  );
};
