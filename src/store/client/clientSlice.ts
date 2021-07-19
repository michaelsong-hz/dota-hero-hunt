import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import localForage from "localforage";

import { Modals } from "models/Modals";
import {
  selectPlayerName,
  setSettingsLoaded,
  updateModalToShow,
} from "store/application/applicationSlice";
import { setPlayerName } from "store/application/applicationThunks";
import { resetPlayers } from "store/game/gameSlice";
import { initializeSettingsAsync } from "store/game/gameThunks";
import { AppDispatch, AppThunk, RootState } from "store/rootStore";
import { StorageConstants } from "utils/constants";

import {
  clientPeerConnectedAction,
  clientPeerStartAction,
  clientPeerStopAction,
} from "./clientActions";
import { CLIENT_PEER_CONNECTED } from "./clientConstants";

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
  extraReducers: (builder) => {
    builder.addCase(CLIENT_PEER_CONNECTED, (state, action) => {
      if (clientPeerConnectedAction.match(action))
        state.remoteHostID = action.payload.hostID;
    });
  },
});

export const {
  setRemoteHostID,
  setIsJoiningGame,
  setIsNameTaken,
  resetClientState,
} = clientSlice.actions;

export const selectRemoteHostID = (state: RootState): string | null =>
  state.client.remoteHostID;
export const selectIsJoiningGame = (state: RootState): boolean =>
  state.client.isJoiningGame;
export const selectIsNameTaken = (state: RootState): boolean =>
  state.client.isNameTaken;

export const connectToHost = (): AppThunk => (dispatch, getState) => {
  if (selectIsJoiningGame(getState()) === false) {
    dispatch(clientPeerStartAction());
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
  dispatch(initializeSettingsAsync());
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
  dispatch(clientPeerStopAction());
  clientReset(dispatch);
};

export default clientSlice.reducer;
