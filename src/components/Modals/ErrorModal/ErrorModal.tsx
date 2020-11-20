import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { appendTheme } from "utils/utilities";

type ErrorModalProps = {
  title: string;
  bodyText: string[];
  isDismissible?: boolean;
  footer?: JSX.Element;
};

function ErrorModal(props: ErrorModalProps): JSX.Element {
  const history = useHistory();
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const { title, bodyText, isDismissible, footer } = props;

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
    let index = 0;
    state.modalCustomMessage.forEach((pText) => {
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
          variant={appendTheme("primary", state.appSettings.isDark)}
          onClick={() => handleReturnHome()}
        >
          Return to Home Page
        </Button>
      );
    }
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
