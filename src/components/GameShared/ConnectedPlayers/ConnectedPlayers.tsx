import React from "react";

import { useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { selectGameStatus, selectPlayers } from "store/game/gameSlice";

function ConnectedPlayers(): JSX.Element {
  const gameStatus = useAppSelector(selectGameStatus);
  const players = useAppSelector(selectPlayers);

  const connectedPlayers: JSX.Element[] = [];

  for (const [readPlayerName, player] of Object.entries(players)) {
    let playerName = readPlayerName;
    if (playerName === "" && gameStatus !== GameStatus.SETTINGS) {
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
        {gameStatus !== GameStatus.SETTINGS && (
          <div className="align-self-center ml-3">
            <h5 className="">{player.score}</h5>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="connected-players my-2 mx-3">
      <h2>Players</h2>
      {connectedPlayers}
    </div>
  );
}

export default ConnectedPlayers;
