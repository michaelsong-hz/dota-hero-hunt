import React from "react";
import { Col, Row } from "react-bootstrap";

import { useStoreState } from "reducer/store";

function ConnectedPlayers(): JSX.Element {
  const state = useStoreState();

  const connectedPlayers: JSX.Element[] = [];

  for (const [playerName, player] of Object.entries(state.players)) {
    connectedPlayers.push(
      <Row key={`player-${playerName}`} className="d-flex ">
        <Col xs="auto" className="mr-auto align-self-center">
          <h4>{playerName}</h4>
        </Col>
        {state.round > 0 && (
          <Col xs="auto" className="align-self-center">
            <h5 className="">{player.score}</h5>
          </Col>
        )}
      </Row>
    );
  }
  return (
    <>
      <Row>
        <Col>
          <h2 className="pt-1">Players</h2>
        </Col>
      </Row>
      {connectedPlayers}
    </>
  );
}

export default ConnectedPlayers;
