import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import { Redirect } from "react-router-dom";

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
    <div>
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
          <div className="d-flex flex-column align-items-center">
            <div className="p-2">
              <h1>Dota Hero Hunt</h1>
            </div>
            <div className="p-2">
              <Button
                className="homepage-button"
                size="lg"
                onClick={() => setToHostGame(true)}
              >
                Create Private Game
              </Button>
            </div>
            <div>
              <Button
                className="homepage-button"
                variant="secondary"
                onClick={() => setShowConnectionModal(true)}
              >
                Join Existing Game
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default HomePage;
