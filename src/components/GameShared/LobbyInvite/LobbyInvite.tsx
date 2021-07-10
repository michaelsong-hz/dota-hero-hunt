import React from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { useAppSelector, useAppDispatch } from "hooks/useStore";
import {
  selectIsDark,
  selectIsInviteLinkCopied,
  setIsInviteLinkCopied,
} from "store/application/applicationSlice";
import {
  isSinglePlayer,
  selectHostID,
  selectIsGeneratingLink,
} from "store/host/hostSlice";
import { startHosting, stopHosting } from "store/host/hostThunks";
import {
  appendTheme,
  getClientInviteLink,
  getHostInviteLink,
  isClient,
} from "utils/utilities";

function LobbyInvite(): JSX.Element {
  const isSingleP = useAppSelector(isSinglePlayer);
  const hostID = useAppSelector(selectHostID);
  const isGeneratingLink = useAppSelector(selectIsGeneratingLink);
  const isInviteLinkCopied = useAppSelector(selectIsInviteLinkCopied);
  const isDark = useAppSelector(selectIsDark);

  const dispatch = useAppDispatch();

  function getStopHostingButton() {
    if (!isSingleP && !isClient())
      return (
        <div className="mb-2 ml-2">
          <Button
            disabled={isGeneratingLink}
            variant={"danger"}
            onClick={() => dispatch(stopHosting())}
          >
            Stop Hosting
          </Button>
        </div>
      );
    return <></>;
  }

  function getHeaderText(): string {
    if (isSingleP) {
      if (isGeneratingLink) {
        return "Generating Invite Link...";
      } else {
        return "Invite Your Friends!";
      }
    }
    return "The lobby invite link is:";
  }

  function getInviteText(): string {
    if (isClient()) {
      return getClientInviteLink();
    }
    return getHostInviteLink(hostID);
  }

  function getButtonText(): string {
    if (isSingleP) {
      return "Generate";
    }
    return "Copy";
  }

  function handleGenerateInvite() {
    if (isSingleP) {
      dispatch(startHosting());
    } else {
      if (isClient()) {
        navigator.clipboard.writeText(getClientInviteLink());
      } else {
        navigator.clipboard.writeText(getHostInviteLink(hostID));
      }
      dispatch(setIsInviteLinkCopied(true));
    }
  }

  return (
    <div className={`${appendTheme("content-holder", isDark)} px-3 py-2`}>
      <Row>
        <Col className="d-flex">
          <div className="mr-auto">
            <h3>{getHeaderText()}</h3>
          </div>
          {getStopHostingButton()}
        </Col>
      </Row>
      <Row className="no-gutters pb-1">
        <Col className="mr-2">
          <Form.Control disabled={true} value={getInviteText()}></Form.Control>
        </Col>
        <Col xs="auto">
          <Button
            disabled={isGeneratingLink}
            variant={appendTheme("secondary", isDark)}
            onClick={() => handleGenerateInvite()}
          >
            {getButtonText()}
          </Button>
        </Col>
      </Row>
      {isInviteLinkCopied === true && (
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
