import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import localForage from "localforage";

import { ClientTypes } from "models/MessageClientTypes";
import { Modals } from "models/Modals";
import {
  selectPlayerName,
  setPlayerName,
  setSettingsLoaded,
  updateModalToShow,
} from "store/application/applicationSlice";
import { resetPlayers } from "store/game/gameSlice";
import { loadStoredGameSettings } from "store/loadSettings";
import {
  PEER_CLIENT_CONNECT,
  PEER_CLIENT_DISCONNECT,
  PEER_CLIENT_SEND,
} from "store/middleware/middlewareConstants";
import { AppDispatch, AppThunk, RootState } from "store/rootStore";
import { StorageConstants } from "utils/constants";

export interface ClientState {
  remoteHostID: string | null;
  isJoiningGame: boolean;
  isNameTaken: boolean;
}

const initialState: ClientState = {
  remoteHostID: null,
  isJoiningGame: false,
  isNameTaken: false,
};

export const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setRemoteHostID: (state, action: PayloadAction<string | null>) => {
      state.remoteHostID = action.payload;
    },
    setIsJoiningGame: (state, action: PayloadAction<boolean>) => {
      state.isJoiningGame = action.payload;
    },
    setIsNameTaken: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.remoteHostID = null;
        state.isJoiningGame = false;
      }
      state.isNameTaken = action.payload;
    },
    resetClientState: (state) => {
      state.remoteHostID = null;
      state.isJoiningGame = false;
      state.isNameTaken = false;
    },
  },
});

export const {
  setRemoteHostID,
  setIsJoiningGame,
  setIsNameTaken,
  resetClientState,
} = clientSlice.actions;

export const startClientWS = createAction(PEER_CLIENT_CONNECT);
export const stopClientWS = createAction(PEER_CLIENT_DISCONNECT);
export const clientWSSend = createAction<ClientTypes>(PEER_CLIENT_SEND);

export const selectRemoteHostID = (state: RootState): string | null =>
  state.client.remoteHostID;
export const selectIsJoiningGame = (state: RootState): boolean =>
  state.client.isJoiningGame;
export const selectIsNameTaken = (state: RootState): boolean =>
  state.client.isNameTaken;

export const connectToHost = (): AppThunk => (dispatch, getState) => {
  if (selectIsJoiningGame(getState()) === false) {
    dispatch(startClientWS());
    dispatch(setIsJoiningGame(true));
    dispatch(setIsNameTaken(false));

    localForage.setItem(
      StorageConstants.PLAYER_NAME,
      selectPlayerName(getState())
    );
  }
};

export const clientNameChange =
  (newPlayerName: string): AppThunk =>
  (dispatch) => {
    dispatch(setPlayerName(newPlayerName));
    dispatch(setIsNameTaken(false));
  };

function clientReset(dispatch: AppDispatch) {
  dispatch(setSettingsLoaded(false));
  loadStoredGameSettings();
  dispatch(resetClientState());
  dispatch(resetPlayers());
}

// Called when the client is forcefully disconnected
// Clean up state and display error modal
export const clientForcefulDisconnect =
  (modal: Modals, message?: string[]): AppThunk =>
  (dispatch) => {
    dispatch(updateModalToShow({ modal, message }));
    clientReset(dispatch);
  };

export const clientDisconnect = (): AppThunk => (dispatch) => {
  dispatch(stopClientWS());
  clientReset(dispatch);
};

export default clientSlice.reducer;
