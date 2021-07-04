import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useStoreState } from "reducer/store";
import { StorageConstants } from "utils/constants";
import { appendTheme } from "utils/utilities";

interface PlayerNameModalProps {
  playerName: string;
  showPlayerNameModal: boolean;
  submitPlayerName: (playerName: string) => void;
  goBack: () => void;
}

function PlayerNameModal(props: PlayerNameModalProps): JSX.Element {
  const state = useStoreState();
  const [isInvalidName, setIsInvalidName] = useState(false);
  const [typedPlayerName, setTypedPlayerName] = useState(props.playerName);

  function handleClose() {
    // TODO: Check that the player name hasn't been taken
    if (!isStringValid(typedPlayerName)) {
      setIsInvalidName(true);
    } else {
      localStorage.setItem(StorageConstants.PLAYER_NAME, typedPlayerName);
      props.submitPlayerName(typedPlayerName);
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
    setTypedPlayerName(playerName);
  }

  // Autofocuses the text field
  function NameInput() {
    const innerRef = useRef<HTMLInputElement>();
    useEffect(() => innerRef.current && innerRef.current.focus());

    return (
      <Form.Control
        ref={innerRef as MutableRefObject<HTMLInputElement | null>}
        isInvalid={isInvalidName}
        type="text"
        placeholder="Enter your name"
        defaultValue={typedPlayerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
    );
  }

  function handleCancel() {
    // Reset typed name in the modal in case it is reopened
    setTypedPlayerName(props.playerName);
    // Submit the old name to close the modal
    props.submitPlayerName(props.playerName);
  }

  return (
    <Modal show={props.showPlayerNameModal} onHide={() => handleCancel()}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>Set Your Player Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {props.playerName === "" && (
            <p style={{ color: "#212529" }}>
              To invite your friends to play with you, you first need to set a
              player name.
            </p>
          )}
          <Form.Group>
            {NameInput()}
            <Form.Control.Feedback type="invalid">
              Please enter a player name.
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={appendTheme("secondary", state.appSettings.isDark)}
            onClick={handleCancel}
          >
            Cancel
          </Button>
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
