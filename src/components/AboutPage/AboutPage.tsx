import React from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import HeroHuntIcon from "images/HeroHuntIcon.svg";
import { InstallStatus } from "models/InstallStatus";
import { useStoreState } from "reducer/store";
import { getAppVersion } from "utils/utilities";

function AboutPage(): JSX.Element {
  const state = useStoreState();

  function getInstallStatusText(): JSX.Element {
    switch (state.installStatus) {
      case InstallStatus.CHECKING: {
        return <p>Checking Dota Hero Hunt installation status...</p>;
      }
      case InstallStatus.INSTALLING: {
        return (
          <p>
            Downloading assets for Dota Hero Hunt to optimize your gameplay
            experience...
          </p>
        );
      }
      case InstallStatus.INSTALLED: {
        return (
          <p>
            Assets for Dota Hero Hunt have been saved for offline use, allowing
            you to play in single player mode without an internet connection!
            This also speeds up the performance of Dota Hero Hunt during regular
            gameplay.
          </p>
        );
      }
      case InstallStatus.ERROR: {
        return (
          <p>
            An error was encountered while saving assets for Dota Hero Hunt on
            this device.
          </p>
        );
      }
    }
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col className="about-title">
          <img
            alt="Dota Hero Hunt logo"
            width="57"
            height="57"
            src={HeroHuntIcon}
            className="mr-3"
          />
          <h1 className="mb-1">About Dota Hero Hunt</h1>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <p>
            First seen in The International 10 Battle Pass, Dota Hero Hunt is a
            recreation of the beloved Dota minigame which you can play anywhere,
            anytime!
          </p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <h2 className="mb-1">Installation Status</h2>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col>{getInstallStatusText()}</Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <p>Version {getAppVersion()}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default AboutPage;
