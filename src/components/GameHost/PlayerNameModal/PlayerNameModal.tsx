import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useStoreState } from "reducer/store";
import { StorageConstants } from "utils/constants";
import { appendTheme } from "utils/utilities";

interface PlayerNameModalProps {
  playerName: string;
  showPlayerNameModal: boolean;
  setPlayerName: (playerName: string) => void;
  submitPlayerName: (playerName: string) => void;
}

function PlayerNameModal(props: PlayerNameModalProps): JSX.Element {
  const state = useStoreState();
  const [isInvalidName, setIsInvalidName] = useState(false);

  function handleClose() {
    // TODO: Check that the player name hasn't been taken
    if (!isStringValid(props.playerName)) {
      setIsInvalidName(true);
    } else {
      localStorage.setItem(StorageConstants.PLAYER_NAME, props.playerName);
      props.submitPlayerName(props.playerName);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();

    handleClose();
  }

  function isStringValid(strTocheck: string) {
    if (strTocheck === "") {
      return false;
    }
    return true;
  }

  function setPlayerName(playerName: string) {
    setIsInvalidName(false);
    props.setPlayerName(playerName);
  }

  return (
    <Modal show={props.showPlayerNameModal} onHide={() => handleClose()}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>Set Your Player Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              isInvalid={isInvalidName}
              type="text"
              placeholder="Enter your name"
              defaultValue={props.playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a player name.
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={appendTheme("primary", state.appSettings.isDark)}
            type="submit"
          >
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default PlayerNameModal;
