import { createSlice } from "@reduxjs/toolkit";

import { APPLICATION_RESET } from "store/application/applicationConstants";
import { RootState } from "store/rootStore";

import {
  clientNameChangeAction,
  clientPeerConnectedAction,
  clientPeerStopAction,
} from "./clientActions";
import {
  CLIENT_NAME_CHANGE,
  CLIENT_PEER_CONNECTED,
  CLIENT_PEER_START,
  CLIENT_PEER_STOP,
} from "./clientConstants";

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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(CLIENT_PEER_START, (state) => {
        state.isJoiningGame = true;
        state.isNameTaken = false;
      })
      .addCase(CLIENT_PEER_STOP, (state, action) => {
        if (clientPeerStopAction.match(action)) {
          state.remoteHostID = null;
          state.isJoiningGame = false;
          action.payload.nameTaken === true
            ? (state.isNameTaken = true)
            : (state.isNameTaken = false);
        }
      })
      .addCase(CLIENT_PEER_CONNECTED, (state, action) => {
        if (clientPeerConnectedAction.match(action))
          state.remoteHostID = action.payload.hostID;
      })
      .addCase(CLIENT_NAME_CHANGE, (state, action) => {
        if (clientNameChangeAction.match(action)) state.isNameTaken = false;
      })
      .addCase(APPLICATION_RESET, () => {
        return initialState;
      });
  },
});

export const selectRemoteHostID = (state: RootState): string | null =>
  state.client.remoteHostID;
export const selectIsJoiningGame = (state: RootState): boolean =>
  state.client.isJoiningGame;
export const selectIsNameTaken = (state: RootState): boolean =>
  state.client.isNameTaken;

export default clientSlice.reducer;
