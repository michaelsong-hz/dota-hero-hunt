import { captureException, setContext } from "@sentry/react";
import React from "react";
import { Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import ErrorModal from "components/Modals/ErrorModal";
import { useAppSelector, useAppDispatch } from "hooks/useStore";
import { OtherErrorTypes, RegularModals } from "models/Modals";
import { PeerJSErrorTypes } from "models/PeerErrors";
import {
  selectIsDark,
  selectModalToShow,
} from "store/application/applicationSlice";
import { resetApplication } from "store/application/applicationThunks";
import { appendTheme } from "utils/utilities";

function SharedModal(): JSX.Element {
  const history = useHistory();

  const modalToShow = useAppSelector(selectModalToShow);
  const isDark = useAppSelector(selectIsDark);

  const dispatch = useAppDispatch();

  function handleHide() {
    dispatch(resetApplication());
  }

  function handleReturnHome() {
    handleHide();
    history.push("/");
  }

  function handleRefresh() {
    window.location.reload();
  }

  function getModal(): JSX.Element {
    if (
      modalToShow === null ||
      modalToShow === RegularModals.PLAYER_NAME_MODAL
    ) {
      return <></>;
    }

    switch (modalToShow) {
      case PeerJSErrorTypes.BROWSER_INCOMPATIBLE:
        return (
          <ErrorModal
            title="Browser Multiplayer Error"
            bodyText={[
              `Sorry, your browser is incompatible with dotaherohunt.com&apos;s 
               multiplayer features.`,
              "Please try again on a different browser or device.",
            ]}
          />
        );
      case PeerJSErrorTypes.SERVER_ERROR:
        return (
          <ErrorModal
            title="Error Contacting Game Coordinator"
            bodyText={[
              `Sorry, we were unable to contact the Dota Hero Hunt game 
               coordinator.`,
              "Please check your internet connection, or try again later.",
            ]}
            isDismissible={true}
          />
        );
      case PeerJSErrorTypes.PEER_UNAVAILABLE:
        return (
          <ErrorModal
            title="Error Connecting to Game Session"
            bodyText={[
              "Sorry, we were unable to connect you to the game session.",
              `Either the person who invited you has closed their game, or the 
               invite link you entered is incorrect. Please double check your 
               invite link and try again.`,
            ]}
            isDismissible={true}
          />
        );
      case PeerJSErrorTypes.LOST_CONN_TO_HOST:
        return (
          <ErrorModal
            title="Lost Connection to Host"
            bodyText={[
              "Sorry, it looks like we lost the connection to the host of this game.",
              `Either the person who invited you has closed their game, or one
               of your internet connections is unstable.`,
            ]}
            isDismissible={true}
          />
        );
      case OtherErrorTypes.HOST_DISCONNECTED:
        return (
          <ErrorModal
            title="Game Over"
            bodyText={["The host has disconnected from the game."]}
          />
        );
      case OtherErrorTypes.PEER_JS_SERVER_DISCONNECTED:
        return (
          <ErrorModal
            title="Lost Connection to Server"
            bodyText={[
              "The connection to the game server has been lost.",
              "Please check your internet connection, or try again later.",
            ]}
          />
        );
      case OtherErrorTypes.APP_VERSION_MISMATCH: {
        const customFooter = (
          <>
            <Button
              variant={appendTheme("secondary", isDark)}
              onClick={() => handleReturnHome()}
            >
              Return to Home Page
            </Button>
            <Button
              variant={appendTheme("secondary", isDark)}
              onClick={() => handleRefresh()}
            >
              Refresh Page
            </Button>
            <Button
              variant={appendTheme("primary", isDark)}
              onClick={() => handleHide()}
            >
              Try Again
            </Button>
          </>
        );
        return (
          <ErrorModal
            title="Application Version Mismatch"
            bodyText={[]}
            footer={customFooter}
            isDismissible={true}
          />
        );
      }
    }

    try {
      const unknownModal = modalToShow as unknown as string;
      setContext("Unknown Modal", {
        modal: unknownModal,
      });
      captureException(new Error("Tried to show an unknown modal"));
    } catch (err) {
      captureException(new Error("Tried to show an unknown modal"));
    }

    const customFooter = (
      <>
        <Button
          variant={appendTheme("primary", isDark)}
          onClick={() => window.location.reload()}
        >
          Reload Application
        </Button>
      </>
    );
    return (
      <ErrorModal
        title="A Critical Error has Occurred"
        bodyText={[
          `Sorry! It looks like something went critically wrong, and \
           dotaherohunt.com needs to restart. Please try your action again.`,
        ]}
        footer={customFooter}
      />
    );
  }

  return getModal();
}

export default SharedModal;
