import { PeerJSErrorTypes } from "./PeerErrors";

export type Modals = RegularModals | PeerJSErrorTypes | OtherErrorTypes;

export enum RegularModals {
  PLAYER_NAME_MODAL,
}

export enum OtherErrorTypes {
  GENERIC_ERROR,
  HOST_DISCONNECTED,
  PEER_JS_SERVER_DISCONNECTED,
  APP_VERSION_MISMATCH,
}
