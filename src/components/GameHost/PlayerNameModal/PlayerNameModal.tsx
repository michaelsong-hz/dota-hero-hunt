import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

interface PlayerNameModalProps {
  playerName: string;
  showPlayerNameModal: boolean;
  setPlayerName: (playerName: string) => void;
  submitPlayerName: () => void;
}

function PlayerNameModal(props: PlayerNameModalProps): JSX.Element {
  const [isInvalidName, setIsInvalidName] = useState(false);

  function handleClose() {
    if (!isStringValid(props.playerName)) {
      setIsInvalidName(true);
    } else {
      localStorage.setItem("playerName", props.playerName);
      props.submitPlayerName();
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
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default PlayerNameModal;
