import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import { Redirect } from "react-router-dom";

interface IGamePageProps {
  remoteHostID?: string;
}

function HomePage(): JSX.Element {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [gameID, setGameID] = useState("");
  const [toHostGame, setToHostGame] = useState(false);
  const [toJoinGame, setToJoinGame] = useState(false);

  function handleConnectionModalClose() {
    setShowConnectionModal(false);
  }

  if (toHostGame) {
    return <Redirect to="/play" />;
  }

  if (toJoinGame) {
    return <Redirect to={`/play/${gameID}`} />;
  }

  return (
    <Container>
      <Modal show={showConnectionModal} onHide={handleConnectionModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Joining existing game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Game ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter the game ID to join"
                // defaultValue={playerName}
                onChange={(e) => setGameID(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleConnectionModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setToJoinGame(true)}>
            Connect
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col>
          <h1>Dota Hero Hunt</h1>
        </Col>
      </Row>
      <Row>
        <Col xs="auto">
          <Button onClick={() => setToHostGame(true)}>
            Create Private Game
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="secondary"
            onClick={() => setShowConnectionModal(true)}
          >
            Join Existing Game
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
