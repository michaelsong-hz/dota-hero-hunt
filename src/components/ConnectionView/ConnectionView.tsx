import React, { useEffect, useState } from "react";
import { Col, Modal, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Redirect } from "react-router-dom";

interface ConnectionViewProps {
  playerName: string;
  isNameTaken: boolean;
  peerError: string | undefined;
  connectToHost: () => void;
  setPlayerName: (playerName: string) => void;
  setIsNameTaken: (isTaken: boolean) => void;
}

function ConnectionView(props: ConnectionViewProps): JSX.Element {
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [showError, setShowError] = useState(false);

  const [toHomePage, setToHomePage] = useState(false);

  useEffect(() => {
    if (props.peerError) {
      setShowError(true);
    }
  }, [props.peerError]);

  function joinGame(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();

    if (!isJoiningGame) {
      localStorage.setItem("playerName", props.playerName);
      setIsJoiningGame(true);
      props.setIsNameTaken(false);
      props.connectToHost();
    }
  }

  function renderJoinGameStatus(): JSX.Element {
    if (isJoiningGame) {
      return (
        <>
          <Spinner
            className="mr-2"
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          Joining Game
        </>
      );
    }
    return <>Join Game</>;
  }

  function handleNameChange(newPlayerName: string) {
    props.setPlayerName(newPlayerName);
    props.setIsNameTaken(false);
  }

  useEffect(() => {
    if (props.isNameTaken) {
      setIsJoiningGame(false);
    }
  }, [props.isNameTaken]);

  if (toHomePage) {
    return <Redirect to="/" />;
  }

  return (
    <div>
      <Modal show={showError} onHide={() => setToHomePage(true)}>
        <Modal.Header>
          <Modal.Title>Error Joining Game Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Sorry, we were unable to connect you to the game session.</p>
          <p>
            Either the person who invited you has closed their game, or the
            invite link you entered is incorrect. Please double check your
            invite link and try again.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setToHomePage(true)}>
            Return to home page
          </Button>
        </Modal.Footer>
      </Modal>

      <Row className="text-center">
        <Col>
          <h5>Joining Game Session</h5>
        </Col>
      </Row>
      <Row className="justify-content-center text-center mt-3">
        <Col>
          <Form onSubmit={joinGame}>
            <Form.Group>
              <Form.Label>Set your player name</Form.Label>
              <Form.Control
                isInvalid={props.isNameTaken}
                className="playername-field"
                type="text"
                placeholder="Enter your name"
                defaultValue={props.playerName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                This player name has already been taken.
                <br />
                Please choose a different name.
              </Form.Control.Feedback>
            </Form.Group>
            <Row className="justify-content-center">
              <Button variant="primary" disabled={isJoiningGame} type="submit">
                {renderJoinGameStatus()}
              </Button>
            </Row>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default ConnectionView;
