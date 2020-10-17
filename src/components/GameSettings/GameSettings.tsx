import React, { useContext } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { GameStatusContext } from "reducer/GameStatusContext";

interface GameSettingsProps {
  inviteLink: string;
  startGame: () => void;
}

function GameSettings(props: GameSettingsProps): JSX.Element {
  const { state } = useContext(GameStatusContext);

  function handleSubmit(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();

    props.startGame();
  }

  return (
    <Col>
      <h3>The lobby invite link is:</h3>
      <Row>
        <Col xs="auto">
          <p>{props.inviteLink}</p>
        </Col>
        <Col>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigator.clipboard.writeText(props.inviteLink)}
          >
            Copy
          </Button>
        </Col>
      </Row>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Game Settings</Form.Label>
          <Form.Control
            type="text"
            placeholder="Coming soon"
            onChange={(e) => console.log("")}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Start Game
        </Button>
      </Form>
    </Col>
  );
}

export default GameSettings;
