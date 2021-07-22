import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { RegularModals } from "models/Modals";
import {
  selectIsDark,
  selectIsPlayerNameSet,
  selectModalToShow,
  selectPlayerName,
  updateModalToShow,
} from "store/application/applicationSlice";
import { selectPlayers } from "store/game/gameSlice";
import { submitPlayerName } from "store/host/hostThunks";
import { appendTheme } from "utils/utilities";

enum PlayerNameErrors {
  NONE,
  EMPTY,
  TAKEN,
}

function PlayerNameModal(): JSX.Element {
  const players = useAppSelector(selectPlayers);
  const playerName = useAppSelector(selectPlayerName);
  const modalToShow = useAppSelector(selectModalToShow);
  const isPlayerNameSet = useAppSelector(selectIsPlayerNameSet);
  const isDark = useAppSelector(selectIsDark);
  const dispatch = useAppDispatch();

  const [isInvalidName, setIsInvalidName] = useState(PlayerNameErrors.NONE);
  const [typedPlayerName, setTypedPlayerName] = useState(playerName);

  function handleClose() {
    if (isNameValid(typedPlayerName)) {
      dispatch(submitPlayerName(typedPlayerName));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();

    handleClose();
  }

  function isNameValid(strTocheck: string) {
    // Check that the entered name isn't empty
    if (strTocheck === "") {
      setIsInvalidName(PlayerNameErrors.EMPTY);
      return false;
    }

    // Check that the entered name doesn't exist in the list of players
    for (const existingPlayerName of Object.keys(players)) {
      if (
        playerName !== existingPlayerName &&
        strTocheck === existingPlayerName
      ) {
        setIsInvalidName(PlayerNameErrors.TAKEN);
        return false;
      }
    }

    return true;
  }

  function setPlayerName(playerName: string) {
    setIsInvalidName(PlayerNameErrors.NONE);
    setTypedPlayerName(playerName);
  }

  // Autofocuses the text field
  function NameInputForm() {
    const innerRef = useRef<HTMLInputElement>();
    useEffect(() => innerRef.current && innerRef.current.focus());

    let feedback = "";
    if (isInvalidName === PlayerNameErrors.EMPTY) {
      feedback = "Please enter a player name.";
    } else if (isInvalidName === PlayerNameErrors.TAKEN) {
      feedback =
        "This player name has already been taken. Please choose a different name.";
    }

    return (
      <Form.Group>
        <Form.Control
          ref={innerRef as MutableRefObject<HTMLInputElement | null>}
          isInvalid={isInvalidName !== PlayerNameErrors.NONE}
          type="text"
          placeholder="Enter your name"
          defaultValue={typedPlayerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">{feedback}</Form.Control.Feedback>
      </Form.Group>
    );
  }

  function handleCancel() {
    // Reset typed name in the modal in case it is reopened
    setTypedPlayerName(playerName);
    dispatch(updateModalToShow({ modal: null }));
  }

  return (
    <Modal
      show={modalToShow === RegularModals.PLAYER_NAME_MODAL}
      onHide={() => handleCancel()}
      contentClassName={appendTheme("modal-content", isDark)}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>Set Your Player Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!isPlayerNameSet && (
            <p>
              To invite your friends to play with you, you first need to set a
              player name.
            </p>
          )}
          {NameInputForm()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={appendTheme("secondary", isDark)}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button variant={appendTheme("primary", isDark)} type="submit">
            {!isPlayerNameSet ? "Continue" : "Submit"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default PlayerNameModal;
