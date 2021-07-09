import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

import applicationReducer from "store/application/applicationSlice";
import clientReducer from "store/client/clientSlice";
import gameReducer from "store/game/gameSlice";
import hostReducer from "store/host/hostSlice";

import { audioMiddleware } from "./middleware/audio";
import { clientMiddleware } from "./middleware/clientSocket";
import { hostMiddleware } from "./middleware/hostSocket";

export const store = configureStore({
  reducer: {
    application: applicationReducer,
    client: clientReducer,
    host: hostReducer,
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(clientMiddleware)
      .concat(hostMiddleware)
      .concat(audioMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
