import { setContext } from "@sentry/react";

import { PlayerState } from "models/PlayerState";

export function setPlayersContext(players: Record<string, PlayerState>): void {
  const connectedPlayers: Record<string, PlayerState> = {};
  for (const [key, value] of Object.entries(players)) {
    connectedPlayers[key] = value;
  }
  setContext("Store State Players", connectedPlayers);
}
