import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

interface LobbyInviteProps {
  inviteLink: string;
  isSingleP: boolean;
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

  function handleClick() {
    if (props.isSingleP) {
      if (props.startHosting) {
        setGeneratingLink(true);
        props.startHosting();
      }
    } else {
      navigator.clipboard.writeText(props.inviteLink);
      setShowLinkCopied(true);
    }
  }

  const prevIsSinglePRef = useRef<boolean>();
  useEffect(() => {
    if (prevIsSinglePRef.current === true && props.isSingleP === false) {
      navigator.clipboard.writeText(props.inviteLink);
      setShowLinkCopied(true);
      setGeneratingLink(false);
    }
    prevIsSinglePRef.current = props.isSingleP;
  }, [props.inviteLink, props.isSingleP]);

  return (
    <Col>
      <Col
        className={`${appendTheme(
          "content-holder",
          state.appSettings.isDark
        )} mt-2 pt-2 pb-2`}
      >
        <Row>
          <Col>
            <h3>{getHeaderText()}</h3>
          </Col>
        </Row>
        <Row className="no-gutters pb-1">
          <Col className="mr-2">
            <Form.Control
              disabled={true}
              value={getInviteText()}
            ></Form.Control>
          </Col>
          <Col xs="auto">
            <Button
              disabled={generatingLink}
              variant={appendTheme("secondary", state.appSettings.isDark)}
              onClick={() => handleClick()}
            >
              {getButtonText()}
            </Button>
          </Col>
        </Row>
        {showLinkCopied === true && (
          <Row>
            <Col>
              <p className="float-right mt-1 mb-0">Link copied to clipboard</p>
            </Col>
          </Row>
        )}
      </Col>
    </Col>
  );
}

export default LobbyInvite;
