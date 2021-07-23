import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createReduxEnhancer } from "@sentry/react";

import applicationReducer from "store/application/applicationSlice";
import clientReducer from "store/client/clientSlice";
import gameReducer from "store/game/gameSlice";
import hostReducer from "store/host/hostSlice";

import { loadStoredSettings } from "./application/applicationThunks";
import { audioMiddleware } from "./middleware/audio";
import { clientMiddleware } from "./middleware/clientSocket";
import { hostMiddleware } from "./middleware/hostSocket";

const sentryReduxEnhancer = createReduxEnhancer({
  configureScopeWithState: (scope, state: RootState) => {
    if (state.host.hostID === null) {
      scope.setTag("isHosting", false);
    } else {
      scope.setTag("isHosting", true);
    }
    if (state.client.remoteHostID === null) {
      scope.setTag("isClient", false);
    } else {
      scope.setTag("isClient", true);
    }
  },
});

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
  enhancers: [sentryReduxEnhancer],
});

store.dispatch(loadStoredSettings());

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
