export interface PeerError extends Error {
  type: PeerJSErrorTypes;
}

export enum PeerJSErrorTypes {
  BROWSER_INCOMPATIBLE = "browser-incompatible",
  SERVER_ERROR = "server-error",
  NETWORK = "network",
  PEER_UNAVAILABLE = "peer-unavailable",
  LOST_CONN_TO_HOST = "lost_conn_to_host",
}
