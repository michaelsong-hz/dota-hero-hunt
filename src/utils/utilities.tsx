import Peer from "peerjs";

export function prependCDN(resourceString: string): string {
  return `${process.env.REACT_APP_CDN_URL}${resourceString}`;
}

export function getPeerConfig(): Peer.PeerJSOption {
  if (process.env.NODE_ENV === "development") {
    return {
      host: "localhost",
      port: 9000,
      path: "/play",
    };
  }
  return {
    host: process.env.REACT_APP_PEER_JS_HOST,
    port: parseInt(process.env.REACT_APP_PEER_JS_PORT || ""),
    path: process.env.REACT_APP_PEER_JS_PATH,
  };
}
