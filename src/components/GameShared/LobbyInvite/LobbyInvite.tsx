import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { OtherErrorTypes } from "models/Modals";
import { PeerJSErrorTypes } from "models/PeerErrors";
import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

interface LobbyInviteProps {
  inviteLink: string;
  isSingleP: boolean;
  playerName: string;
  startHosting?: () => void;
}

function LobbyInvite(props: LobbyInviteProps): JSX.Element {
  const state = useStoreState();

  const [generatingLink, setGeneratingLink] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  function getHeaderText(): string {
    if (props.isSingleP) {
      if (generatingLink) {
        return "Generating Invite Link...";
      } else {
        return "Invite Your Friends!";
      }
    }
    return "The lobby invite link is:";
  }

  function getInviteText(): string {
    if (props.isSingleP) {
      return "Click generate to get an invite link";
    }
    return props.inviteLink;
  }

  function getButtonText(): string {
    if (props.isSingleP) {
      return "Generate";
    }
    return "Copy";
  }

  function handleGenerateInvite() {
    if (props.isSingleP) {
      if (props.startHosting) {
        // We need a player name before we can start hosting
        if (props.playerName !== "") {
          setGeneratingLink(true);
        }
        props.startHosting();
      }
    } else {
      navigator.clipboard.writeText(props.inviteLink);
      setShowLinkCopied(true);
    }
  }

  // Writes the invite link to the clipboard once we receive it from the server
  const prevIsSinglePRef = useRef<boolean>();
  useEffect(() => {
    async function writeLinkToClipboard() {
      try {
        await navigator.clipboard.writeText(props.inviteLink);
        setShowLinkCopied(true);
        setGeneratingLink(false);
      } catch (err) {
        /* 😡 SAFARI won't let you copy text to the clipboard if "it's not a
        user action" and this technically isn't tied to a user action as we have
        to wait for the invite link to come back from the server before writing
        it to the clipboard THANKS TIM APPLE 🤡
        It works if you hit copy after the link is generated because then it's
        tied to a "user action" */
        setGeneratingLink(false);
      }
    }

    if (prevIsSinglePRef.current === true && props.isSingleP === false) {
      writeLinkToClipboard();
    }
    prevIsSinglePRef.current = props.isSingleP;
  }, [props.inviteLink, props.isSingleP]);

  // If there was an error with generating an invite link and the user tries
  // again, reset the generate button to be enabled
  const prevModalToShowRef = useRef<PeerJSErrorTypes | OtherErrorTypes | null>(
    null
  );
  useEffect(() => {
    if (prevModalToShowRef !== null && state.modalToShow === null) {
      setGeneratingLink(false);
    }
    prevModalToShowRef.current = state.modalToShow;
  }, [state.modalToShow]);

  return (
    <div
      className={`${appendTheme(
        "content-holder",
        state.appSettings.isDark
      )} px-3 py-2`}
    >
      <Row>
        <Col>
          <h3>{getHeaderText()}</h3>
        </Col>
      </Row>
      <Row className="no-gutters pb-1">
        <Col className="mr-2">
          <Form.Control disabled={true} value={getInviteText()}></Form.Control>
        </Col>
        <Col xs="auto">
          <Button
            disabled={generatingLink}
            variant={appendTheme("secondary", state.appSettings.isDark)}
            onClick={() => handleGenerateInvite()}
          >
            {getButtonText()}
          </Button>
        </Col>
      </Row>
      {showLinkCopied === true && (
        <Row className="slide-down-appear">
          <Col>
            <p className="float-right mt-1 mb-0">Link copied to clipboard</p>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default LobbyInvite;
