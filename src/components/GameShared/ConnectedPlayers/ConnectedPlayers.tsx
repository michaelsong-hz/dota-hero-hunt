import React, { useContext } from "react";
import { Col } from "react-bootstrap";

import { GameStatusContext } from "reducer/GameStatusContext";

function ConnectedPlayers(): JSX.Element {
  const { state } = useContext(GameStatusContext);

  const connectedPlayers: JSX.Element[] = [];
  state.players.forEach((player) => {
    connectedPlayers.push(
      <div key={`player-${player.name}`}>
        <h4>{player.name}</h4>
        <p>{player.score}</p>
        <p>{player.isDisabled}</p>
      </div>
    );
  });
  return (
    <Col xs="auto">
      <h2>Players</h2>
      {connectedPlayers}
    </Col>
  );
}

export default ConnectedPlayers;
