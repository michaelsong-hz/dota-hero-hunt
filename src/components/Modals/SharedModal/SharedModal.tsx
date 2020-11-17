import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import ErrorModal from "components/Modals/ErrorModal";
import { OtherErrorTypes } from "models/Modals";
import { PeerJSErrorTypes } from "models/PeerErrors";
import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { appendTheme } from "utils/utilities";

function SharedModal(): JSX.Element {
  const history = useHistory();
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  function handleHide() {
    dispatch({
      type: StoreConstants.SET_MODAL,
      modal: null,
    });
    history.push("/");
  }

  function getModal(): JSX.Element {
    if (state.modalToShow === null) {
      return <></>;
    }

    switch (state.modalToShow) {
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
            dismissText="Try Again"
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
            dismissText="Try Again"
          />
        );
      case OtherErrorTypes.HOST_DISCONNECTED:
        return (
          <ErrorModal
            title="Game Over"
            bodyText={["The host has disconnected from the game."]}
          />
        );
    }

    return (
      <ErrorModal
        title="A Critical Error has Occurred"
        bodyText={[
          `Sorry! It looks like something went critically wrong, and \
           dotaherohunt.com needs to restart. Please try your action again.`,
        ]}
      />
    );
  }

  return getModal();
}

export default SharedModal;
