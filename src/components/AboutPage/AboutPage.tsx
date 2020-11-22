import React from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import HeroHuntIcon from "images/HeroHuntIcon.svg";
import { getAppVersion } from "utils/utilities";

function AboutPage(): JSX.Element {
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
            First seen in The International 10 Battle Pass, dotaherohunt.com is
            a recreation of the beloved Dota minigame which you can play
            anywhere, anytime!
          </p>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <p>Version {getAppVersion()}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default AboutPage;
