import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { useAppSelector, useAppDispatch } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { isSinglePlayer, selectHostID } from "store/host/hostSlice";
import { startHosting } from "store/host/hostThunks";
import { appendTheme } from "utils/utilities";

function LobbyInvite(): JSX.Element {
  const isSingleP = useAppSelector(isSinglePlayer);
  const hostID = useAppSelector(selectHostID);
  const isDark = useAppSelector(selectIsDark);
  const dispatch = useAppDispatch();

  const [generatingLink, setGeneratingLink] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  function getHeaderText(): string {
    if (isSingleP) {
      if (generatingLink) {
        return "Generating Invite Link...";
      } else {
        return "Invite Your Friends!";
      }
    }
    return "The lobby invite link is:";
  }

  function getInviteText(): string {
    if (isSingleP) {
      return "Click generate to get an invite link";
    }
    return getInviteLink();
  }

  function getButtonText(): string {
    if (isSingleP) {
      return "Generate";
    }
    return "Copy";
  }

  const getInviteLink = useCallback(() => {
    if (hostID) {
      let path = window.location.href;
      path =
        path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
      return `${path}/play/${hostID}`;
    }
    // TODO: Do this for clients too
    return "";
  }, [hostID]);

  function handleGenerateInvite() {
    if (isSingleP) {
      dispatch(startHosting());
    } else {
      navigator.clipboard.writeText(getInviteLink());
      setShowLinkCopied(true);
    }
  }

  // Writes the invite link to the clipboard once we receive it from the server
  const prevIsSinglePRef = useRef<boolean>();
  useEffect(() => {
    async function writeLinkToClipboard() {
      try {
        await navigator.clipboard.writeText(getInviteLink());
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

    if (prevIsSinglePRef.current === true && isSingleP === false) {
      writeLinkToClipboard();
    }
    prevIsSinglePRef.current = isSingleP;
  }, [getInviteLink, isSingleP]);

  // useEffect(() => {
  //   if (state.modalToShow === null) {
  //     setGeneratingLink(false);
  //   }
  // }, [state.modalToShow]);

  return (
    <div className={`${appendTheme("content-holder", isDark)} px-3 py-2`}>
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
            variant={appendTheme("secondary", isDark)}
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
