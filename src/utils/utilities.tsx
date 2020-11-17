import { captureException } from "@sentry/react";
import Peer from "peerjs";

export function appendTheme(themeName: string, isDark: boolean): string {
  if (isDark) {
    return `${themeName}-dark`;
  }
  return `${themeName}-light`;
}

export function prependCDN(resourceString: string): string {
  return `${process.env.REACT_APP_CDN_URL}${resourceString}`;
}

export function getPeerConfig(): Peer.PeerJSOption {
  return {
    host: process.env.REACT_APP_PEER_JS_HOST,
    port: parseInt(process.env.REACT_APP_PEER_JS_PORT || ""),
    path: process.env.REACT_APP_PEER_JS_PATH,
  };
}

export function getPlayerNameFromConn(
  incomingConn: Peer.DataConnection
): string {
  try {
    return incomingConn.metadata.playerName;
  } catch (err) {
    captureException(err);
    return "";
  }
}
