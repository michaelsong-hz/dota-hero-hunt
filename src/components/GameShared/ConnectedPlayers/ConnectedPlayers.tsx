import React from "react";
import { Col } from "react-bootstrap";

import { useStoreState } from "reducer/store";

function ConnectedPlayers(): JSX.Element {
  const state = useStoreState();

  const connectedPlayers: JSX.Element[] = [];

  for (const [playerName, player] of Object.entries(state.players)) {
    connectedPlayers.push(
      <div key={`player-${playerName}`}>
        <h4>{playerName}</h4>
        <p>{player.score}</p>
        <p>{player.isDisabled}</p>
      </div>
    );
  }
  return (
    <Col xs="auto">
      <h2>Players</h2>
      {connectedPlayers}
    </Col>
  );
}

export default ConnectedPlayers;
