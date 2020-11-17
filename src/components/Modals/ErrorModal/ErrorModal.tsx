import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { appendTheme } from "utils/utilities";

type ErrorModalProps = {
  title: string;
  bodyText: string[];
  dismissText?: string;
};

function ErrorModal(props: ErrorModalProps): JSX.Element {
  const history = useHistory();
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const { title, bodyText, dismissText } = props;

  function handleHide() {
    dispatch({
      type: StoreConstants.SET_MODAL,
      modal: null,
    });
  }

  function handleReturnHome() {
    handleHide();
    history.push("/");
  }

  function getBodyText(): JSX.Element[] {
    const pTexts: JSX.Element[] = [];
    bodyText.forEach((pText, i) => {
      pTexts.push(<p key={`error-p${i}`}>{pText}</p>);
    });
    return pTexts;
  }

  function getFooter(): JSX.Element {
    if (dismissText !== undefined) {
      return (
        <>
          <Button
            variant={appendTheme("secondary", state.appSettings.isDark)}
            onClick={() => handleReturnHome()}
          >
            Return to Home Page
          </Button>
          <Button
            variant={appendTheme("primary", state.appSettings.isDark)}
            onClick={() => handleHide()}
          >
            {dismissText}
          </Button>
        </>
      );
    }
    return (
      <Button
        variant={appendTheme("primary", state.appSettings.isDark)}
        onClick={() => handleReturnHome()}
      >
        Return to Home Page
      </Button>
    );
  }

  return (
    <Modal
      show={true}
      onHide={() => handleHide()}
      backdrop={dismissText ? "false" : "static"}
      contentClassName={appendTheme("modal-content", state.appSettings.isDark)}
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
