import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { HostTypes } from "models/MessageHostTypes";
import { Modals } from "models/Modals";
import { updateModalToShow } from "store/application/applicationSlice";
import {
  PEER_HOST_BROADCAST,
  PEER_HOST_START,
} from "store/middleware/middlewareConstants";
import { AppThunk, RootState } from "store/rootStore";
import { isClient } from "utils/utilities";

export interface HostState {
  hostID: string | null;
}

const initialState: HostState = {
  hostID: null,
};

export const hostSlice = createSlice({
  name: "host",
  initialState,
  reducers: {
    setHostID: (state, action: PayloadAction<string>) => {
      state.hostID = action.payload;
    },
    resetHostState: (state) => {
      state.hostID = null;
    },
  },
});

export const { setHostID, resetHostState } = hostSlice.actions;

export const startHostWS = createAction(PEER_HOST_START);
export const hostWSBroadcast = createAction<HostTypes>(PEER_HOST_BROADCAST);

export const selectHostID = (state: RootState): string | null =>
  state.host.hostID;

export const isSinglePlayer = (state: RootState): boolean => {
  if (state.host.hostID === null && !isClient()) {
    return true;
  }
  return false;
};

// Called when the host is forcefully disconnected
// Clean up state and display error modal
export const hostForcefulDisconnect =
  (modal: Modals, message?: string[]): AppThunk =>
  (dispatch) => {
    dispatch(updateModalToShow({ modal, message }));
    dispatch(resetHostState());
  };

export default hostSlice.reducer;
