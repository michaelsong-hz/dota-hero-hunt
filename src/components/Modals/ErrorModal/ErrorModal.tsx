import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import { useAppSelector, useAppDispatch } from "hooks/useStore";
import {
  selectIsDark,
  selectModalCustomMessage,
  updateModalToShow,
} from "store/application/applicationSlice";
import { resetPlayers } from "store/game/gameSlice";
import { appendTheme } from "utils/utilities";

type ErrorModalProps = {
  title: string;
  bodyText: string[];
  isDismissible?: boolean;
  footer?: JSX.Element;
};

function ErrorModal(props: ErrorModalProps): JSX.Element {
  const history = useHistory();

  const isDark = useAppSelector(selectIsDark);
  const modalCustomMessage = useAppSelector(selectModalCustomMessage);

  const dispatch = useAppDispatch();

  const { title, bodyText, isDismissible, footer } = props;

  function handleHide() {
    dispatch(
      updateModalToShow({
        modal: null,
      })
    );
  }

  function handleReturnHome() {
    handleHide();
    dispatch(resetPlayers());
    history.push("/");
  }

  function getBodyText(): JSX.Element[] {
    const pTexts: JSX.Element[] = [];
    let index = 0;
    modalCustomMessage.forEach((pText) => {
      index += 1;
      pTexts.push(<p key={`error-p${index}`}>{pText}</p>);
    });
    bodyText.forEach((pText) => {
      index += 1;
      pTexts.push(<p key={`error-p${index}`}>{pText}</p>);
    });
    return pTexts;
  }

  function getFooter(): JSX.Element {
    if (footer) {
      return footer;
    } else if (isDismissible === undefined || isDismissible === false) {
      return (
        <Button
          variant={appendTheme("primary", isDark)}
          onClick={() => handleReturnHome()}
        >
          Return to Home Page
        </Button>
      );
    }
    return (
      <>
        <Button
          variant={appendTheme("secondary", isDark)}
          onClick={() => handleReturnHome()}
        >
          Return to Home Page
        </Button>
        <Button
          variant={appendTheme("primary", isDark)}
          onClick={() => handleHide()}
        >
          Try Again
        </Button>
      </>
    );
  }

  return (
    <Modal
      show={true}
      onHide={() => handleHide()}
      backdrop={isDismissible ? true : "static"}
      contentClassName={appendTheme("modal-content", isDark)}
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{getBodyText()}</Modal.Body>
      <Modal.Footer>{getFooter()}</Modal.Footer>
    </Modal>
  );
}

export default ErrorModal;
