import { createAction } from "@reduxjs/toolkit";

import { ClientTypes } from "models/MessageClientTypes";
import {
  PEER_CLIENT_CONNECT,
  PEER_CLIENT_DISCONNECT,
  PEER_CLIENT_SEND,
} from "store/middleware/middlewareConstants";

export const startClientWS = createAction(PEER_CLIENT_CONNECT);
export const stopClientWS = createAction(PEER_CLIENT_DISCONNECT);
export const clientWSSend = createAction<ClientTypes>(PEER_CLIENT_SEND);
