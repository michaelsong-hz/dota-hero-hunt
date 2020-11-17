export interface PeerError extends Error {
  type: PeerJSErrorTypes;
}

export enum PeerJSErrorTypes {
  BROWSER_INCOMPATIBLE = "browser-incompatible",
  SERVER_ERROR = "server-error",
  PEER_UNAVAILABLE = "peer-unavailable",
}
