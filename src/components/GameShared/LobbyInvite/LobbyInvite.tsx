import {
  faExternalLinkAlt,
  faLink,
  faUserPlus,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Col, Row } from "react-bootstrap";

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

  function getHeaderText(): string {
    if (isSingleP === true && isGeneratingLink === true) {
      return "Generating Invite Link...";
    }
    return "Invite Your Friends!";
  }

  function getStopHostingButton() {
    if (!isSingleP && !isClient())
      return (
        <Button
          className="lobby-invite-actions-host mr-2"
          disabled={isGeneratingLink}
          variant={appendTheme("danger", isDark)}
          onClick={() => dispatch(stopHosting())}
        >
          <FontAwesomeIcon icon={faUserTimes} className="mr-1" />
          Stop Hosting
        </Button>
      );
    return <></>;
  }

  function getInviteLink() {
    if (isClient()) {
      return getClientInviteLink();
    }
    return getHostInviteLink(hostID);
  }

  function handleShare() {
    navigator.share({
      title: "Invite link for Dota Hero Hunt",
      text: "Let's play Dota Hero Hunt together!",
      url: getInviteLink(),
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(getInviteLink());
    dispatch(setIsInviteLinkCopied(true));
  }

  function getShareActions() {
    return (
      <>
        {navigator.share !== undefined && (
          <Button
            className="mr-2"
            variant={appendTheme("secondary", isDark)}
            onClick={() => handleShare()}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
            Share
          </Button>
        )}
        <Button
          variant={appendTheme("secondary", isDark)}
          onClick={() => handleCopy()}
        >
          <FontAwesomeIcon icon={faLink} className="mr-1" />
          Copy Link
        </Button>
      </>
    );
  }

  return (
    <div className={`${appendTheme("content-holder", isDark)} px-3 py-2`}>
      <Row>
        <Col className="lobby-invite d-flex">
          <h3 className="lobby-invite-text mr-auto">{getHeaderText()}</h3>
          <div className="lobby-invite-actions d-flex">
            {isSingleP === true ? (
              <Button
                disabled={isGeneratingLink === true}
                variant={appendTheme("secondary", isDark)}
                onClick={() => dispatch(startHosting())}
              >
                <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                Generate Invite Link
              </Button>
            ) : (
              <>
                <div>{getStopHostingButton()}</div>
                <div>{getShareActions()}</div>
              </>
            )}
          </div>
        </Col>
      </Row>
      {isInviteLinkCopied === true && (
        <Row className="slide-down-appear">
          <Col>
            <p className="lobby-invite-copy mt-1 mb-0">
              Link copied to clipboard
            </p>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default LobbyInvite;
