import React from "react";

import { useStoreState } from "reducer/store";

function ConnectedPlayers(): JSX.Element {
  const state = useStoreState();

  const connectedPlayers: JSX.Element[] = [];

  for (const [readPlayerName, player] of Object.entries(state.players)) {
    let playerName = readPlayerName;
    if (playerName === "" && state.round > 0) {
      playerName = "Your score:";
    }
    connectedPlayers.push(
      <div
        key={`player-${playerName}`}
        className="d-flex flex-row justify-content-between"
      >
        <div className="conn-player-name align-self-center">
          <h4>{playerName}</h4>
        </div>
        {state.round > 0 && (
          <div className="align-self-center ml-3">
            <h5 className="">{player.score}</h5>
          </div>
        )}
      </div>
    );
  }

  function getHeaderText() {
    if (connectedPlayers.length > 1 || state.round === 0) {
      return <h2>Players</h2>;
    }
    return <></>;
  }

  return (
    <div className="connected-players mt-1">
      {getHeaderText()}
      {connectedPlayers}
    </div>
  );
}

export default ConnectedPlayers;
