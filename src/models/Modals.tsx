import { PeerJSErrorTypes } from "./PeerErrors";

export type Modals = PeerJSErrorTypes | OtherErrorTypes;

export enum OtherErrorTypes {
  GENERIC_ERROR,
  HOST_DISCONNECTED,
  PEER_JS_SERVER_DISCONNECTED,
  APP_VERSION_MISMATCH,
}
