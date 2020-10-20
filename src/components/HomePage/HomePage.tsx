import React, { useState } from "react";
import { Container, Jumbotron } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import { Redirect } from "react-router-dom";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

function HomePage(): JSX.Element {
  const state = useStoreState();

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [gameID, setGameID] = useState("");
  const [toHostGame, setToHostGame] = useState(false);
  const [toJoinGame, setToJoinGame] = useState(false);

  function handleConnectionModalClose() {
    setShowConnectionModal(false);
  }

  function getJumbotronClassName(): string {
    let returnString = "d-flex flex-column align-items-center";
    if (state.appSettings.isDark) {
      returnString += " bg-dark";
    }
    return returnString;
  }

  if (toHostGame) {
    return <Redirect to="/play" />;
  }

  if (toJoinGame) {
    return <Redirect to={`/play/${gameID}`} />;
  }

  return (
    <Container className="mt-4">
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
                onChange={(e) => setGameID(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={appendTheme("secondary", state.appSettings.isDark)}
            onClick={handleConnectionModalClose}
          >
            Cancel
          </Button>
          <Button
            variant={appendTheme("primary", state.appSettings.isDark)}
            onClick={() => setToJoinGame(true)}
          >
            Connect
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col>
          <Jumbotron className={getJumbotronClassName()}>
            <div className="p-2">
              <h1>Dota Hero Hunt</h1>
            </div>
            <div className="p-2">
              <Button
                className="homepage-button"
                variant={appendTheme("primary", state.appSettings.isDark)}
                size="lg"
                onClick={() => setToHostGame(true)}
              >
                Create Private Game
              </Button>
            </div>
            <div>
              <Button
                className="homepage-button"
                variant={appendTheme("secondary", state.appSettings.isDark)}
                onClick={() => setShowConnectionModal(true)}
              >
                Join Existing Game
              </Button>
            </div>
          </Jumbotron>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
