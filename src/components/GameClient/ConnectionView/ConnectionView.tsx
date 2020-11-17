import React, { useEffect, useState } from "react";
import { Col, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { useStoreState } from "reducer/store";
import { StorageConstants } from "utils/constants";
import { appendTheme } from "utils/utilities";

interface ConnectionViewProps {
  playerName: string;
  isNameTaken: boolean;
  connectToHost: () => void;
  setPlayerName: (playerName: string) => void;
  setIsNameTaken: (isTaken: boolean) => void;
}

function ConnectionView(props: ConnectionViewProps): JSX.Element {
  const state = useStoreState();
  const [isJoiningGame, setIsJoiningGame] = useState(false);

  function joinGame(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();

    if (!isJoiningGame) {
      localStorage.setItem(StorageConstants.PLAYER_NAME, props.playerName);
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

  // Re-enable button after name conflict error
  useEffect(() => {
    if (props.isNameTaken) {
      setIsJoiningGame(false);
    }
  }, [props.isNameTaken]);

  // Re-enable button after connection error
  useEffect(() => {
    if (state.modalToShow !== null) {
      setIsJoiningGame(false);
    }
  }, [state.modalToShow]);

  return (
    <>
      <Row className="text-center">
        <Col>
          <h3>Joining Game Session</h3>
        </Col>
      </Row>
      <Row className="justify-content-center text-center mt-3">
        <Col>
          <Form onSubmit={joinGame}>
            <Form.Group>
              <Form.Label
                className={appendTheme("global-text", state.appSettings.isDark)}
              >
                Set your player name
              </Form.Label>
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
              <Button
                variant={appendTheme("primary", state.appSettings.isDark)}
                disabled={isJoiningGame}
                type="submit"
              >
                {renderJoinGameStatus()}
              </Button>
            </Row>
          </Form>
        </Col>
      </Row>
    </>
  );
}

export default ConnectionView;
