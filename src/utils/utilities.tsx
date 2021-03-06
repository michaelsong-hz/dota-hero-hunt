import { captureException, setContext } from "@sentry/react";
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

export function getIconPath(fileName: string): string {
  const pathName = `icons/${fileName}`;
  return `${prependCDN(pathName)}`;
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
    try {
      setContext("Invalid Connection Metadata", {
        connection: JSON.stringify(incomingConn),
      });
    } catch (err) {
      setContext("Invalid Connection Metadata", {
        error: err,
      });
    }

    captureException(err);
    return "";
  }
}

export function getVersionFromConn(incomingConn: Peer.DataConnection): string {
  try {
    return incomingConn.metadata.version;
  } catch (err) {
    try {
      setContext("Invalid Connection Metadata", {
        connection: JSON.stringify(incomingConn),
      });
    } catch (err) {
      setContext("Invalid Connection Metadata", {
        error: err,
      });
    }

    captureException(err);
    return "";
  }
}

export function getAppVersion(): string {
  if (process.env.REACT_APP_VERSION) {
    return process.env.REACT_APP_VERSION;
  }
  captureException(new Error("Env: REACT_APP_VERSION not set"));
  return "";
}
