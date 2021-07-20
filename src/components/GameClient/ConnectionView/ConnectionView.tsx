import React from "react";
import { Col, Spinner } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import {
  selectIsDark,
  selectPlayerName,
} from "store/application/applicationSlice";
import {
  selectIsJoiningGame,
  selectIsNameTaken,
} from "store/client/clientSlice";
import { clientNameChange, clientPeerStart } from "store/client/clientThunks";
import { appendTheme } from "utils/utilities";

function ConnectionView(): JSX.Element {
  const dispatch = useAppDispatch();
  const playerName = useAppSelector(selectPlayerName);
  const isDark = useAppSelector(selectIsDark);
  const isJoiningGame = useAppSelector(selectIsJoiningGame);
  const isNameTaken = useAppSelector(selectIsNameTaken);

  function joinGame(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();
    dispatch(clientPeerStart());
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
    dispatch(clientNameChange(newPlayerName));
  }

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
              <Form.Label className={appendTheme("global-text", isDark)}>
                Set your player name
              </Form.Label>
              <Form.Control
                isInvalid={isNameTaken}
                className="playername-field"
                type="text"
                placeholder="Enter your name"
                defaultValue={playerName}
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
                variant={appendTheme("primary", isDark)}
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
