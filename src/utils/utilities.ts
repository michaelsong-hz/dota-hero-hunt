import { captureException, setContext } from "@sentry/react";
import { PeerJSOption } from "peerjs";
import { UseTransitionProps } from "react-spring";

import {
  GameSettings,
  GameSettingErrors,
  GridSizeTypes,
} from "models/GameSettingsType";
import { ClientDataConnection } from "models/MessageHostTypes";

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

export function getPeerConfig(): PeerJSOption {
  return {
    host: process.env.REACT_APP_PEER_JS_HOST,
    port: parseInt(process.env.REACT_APP_PEER_JS_PORT || ""),
    path: process.env.REACT_APP_PEER_JS_PATH,
  };
}

export function getPlayerNameFromConn(
  incomingConn: ClientDataConnection
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

export function getVersionFromConn(incomingConn: ClientDataConnection): string {
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
      `The heroes per round must not be larger than the total number of hero icons (${numHeroIcons}).`,
    ]);
  } else if (currSettings.targetRoundScore <= 0) {
    settingsErrors.push([
      GameSettingErrors.INVALID_POINTS_TO_ADVANCE,
      "The heroes per round must be greater than 0.",
    ]);
  }

  return settingsErrors;
}

export function isClient(): boolean {
  // Clients always have a pathname: /play/:gameID
  // Hosts have / or /settings
  if ((window.location.pathname.match(/\//g) || []).length === 2) {
    return true;
  }
  return false;
}

export function getHostInviteLink(hostID: string | null): string {
  if (hostID !== undefined && hostID !== null) {
    const pathParts = window.location.href.split("/");
    return `${pathParts[0]}//${pathParts[2]}/play/${hostID}`;
  }
  return "Click generate to get an invite link";
}

export function getClientInviteLink(): string {
  return window.location.href;
}

export function convertRemToPixels(rem: number): number {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

/**
 * Transitions used to navigate between views
 * @param isSMPlus Switches to a different transition on mobile/desktop
 * @param shouldReverse When navigating back to the root view
 * @returns A react-spring transition object
 */
export function getGlobalTransitions(
  isSMPlus: boolean,
  shouldReverse: boolean,
  disableLeave?: boolean
): UseTransitionProps {
  if (isSMPlus) {
    return {
      initial: {
        transform: "translate(0%, 0) scale(0.9)",
      },
      from: {
        opacity: 0,
        transform: shouldReverse
          ? "translate(0%, 0) scale(1.1)"
          : "translate(0%, 0) scale(0.9)",
      },
      enter: {
        opacity: 1,
        transform: "translate(0%, 0) scale(1)",
      },
      leave: {
        opacity: 0,
        transform: shouldReverse
          ? "translate(0%, 0) scale(0.9)"
          : "translate(0%, 0) scale(1.1)",
        position: "absolute",
        width: "100%",
        immediate: disableLeave ? true : false,
      },
      config: { mass: 1, tension: 240, friction: 20, clamp: true },
    };
  }

  return {
    initial: {
      transform: "translate(0%, 0) scale(0.9)",
    },
    from: {
      transform: shouldReverse
        ? "translate(-20%, 0) scale(1)"
        : "translate(100%, 0) scale(1)",
      opacity: 0,
    },
    enter: {
      transform: "translate(0%, 0) scale(1)",
      opacity: 1,
    },
    leave: {
      transform: shouldReverse
        ? "translate(100%, 0) scale(1)"
        : "translate(-20%, 0) scale(1)",
      opacity: 0,
      position: "absolute",
      width: "100%",
      immediate: disableLeave ? true : false,
    },
    config: { mass: 1, tension: 210, friction: 26, clamp: true },
  };
}

export function isDevCheatsEnabled(): boolean {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_DEV_CHEATS === "True"
  ) {
    return true;
  }
  return false;
}
