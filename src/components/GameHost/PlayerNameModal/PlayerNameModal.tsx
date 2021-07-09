import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { RegularModals } from "models/Modals";
import {
  selectIsDark,
  selectModalToShow,
  selectPlayerName,
  updateModalToShow,
} from "store/application/applicationSlice";
import { submitPlayerName } from "store/host/hostThunks";
import { appendTheme } from "utils/utilities";

function PlayerNameModal(): JSX.Element {
  const playerName = useAppSelector(selectPlayerName);
  const modalToShow = useAppSelector(selectModalToShow);
  const isDark = useAppSelector(selectIsDark);
  const dispatch = useAppDispatch();

  const [isInvalidName, setIsInvalidName] = useState(false);
  const [typedPlayerName, setTypedPlayerName] = useState(playerName);

  function handleClose() {
    // TODO: Check that the player name hasn't been taken
    if (!isStringValid(typedPlayerName)) {
      setIsInvalidName(true);
    } else {
      dispatch(submitPlayerName(typedPlayerName));
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
    setTypedPlayerName(playerName);
    dispatch(updateModalToShow({ modal: null }));
  }

  return (
    <Modal
      show={modalToShow === RegularModals.PLAYER_NAME_MODAL}
      onHide={() => handleCancel()}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header>
          <Modal.Title>Set Your Player Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {playerName === "" && (
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
            variant={appendTheme("secondary", isDark)}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button variant={appendTheme("primary", isDark)} type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default PlayerNameModal;
