import { captureException, setContext } from "@sentry/react";
import Peer from "peerjs";

import {
  GameSettings,
  GameSettingErrors,
  GridSizeTypes,
} from "models/GameSettingsType";

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

export function checkForSettingsErrors(
  currSettings: GameSettings
): Array<[GameSettingErrors, string]> {
  const numHeroIcons = currSettings.columns * currSettings.rows;
  const settingsErrors: Array<[GameSettingErrors, string]> = [];

  if (
    isNaN(currSettings.gridSize) ||
    !(currSettings.gridSize in GridSizeTypes)
  ) {
    settingsErrors.push([
      GameSettingErrors.INVALID_GRID_SIZE_TYPE,
      "The selected grid size is invalid.",
    ]);
  }

  if (
    currSettings.targetTotalScore !== null &&
    (isNaN(currSettings.targetTotalScore) || currSettings.targetTotalScore <= 0)
  ) {
    settingsErrors.push([
      GameSettingErrors.INVALID_POINTS_TO_WIN,
      "The total points to win must be greater than 0.",
    ]);
  }

  if (
    currSettings.targetRoundScore === null ||
    currSettings.targetRoundScore === undefined ||
    isNaN(currSettings.targetRoundScore)
  ) {
    settingsErrors.push([
      GameSettingErrors.INVALID_POINTS_TO_ADVANCE,
      "You must set a target score for each round.",
    ]);
  } else if (currSettings.targetRoundScore > numHeroIcons) {
    settingsErrors.push([
      GameSettingErrors.INVALID_POINTS_TO_ADVANCE,
      `The points to advance a round must not be larger than the total number of hero icons (${numHeroIcons}).`,
    ]);
  } else if (currSettings.targetRoundScore <= 0) {
    settingsErrors.push([
      GameSettingErrors.INVALID_POINTS_TO_ADVANCE,
      "The points to advance a round must be greater than 0.",
    ]);
  }

  return settingsErrors;
}

export function isClient(): boolean {
  const path = window.location.pathname;
  if (path.length <= 1) {
    return false;
  }
  return true;
}

export function getHostInviteLink(hostID: string | null): string {
  if (hostID !== undefined && hostID !== null) {
    let path = window.location.href;
    path =
      path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
    return `${path}/play/${hostID}`;
  }
  return "Click generate to get an invite link";
}

export function getClientInviteLink(): string {
  return window.location.href;
}
