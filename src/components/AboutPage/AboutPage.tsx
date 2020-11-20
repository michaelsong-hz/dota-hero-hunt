import React from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { getAppVersion } from "utils/utilities";

function AboutPage(): JSX.Element {
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h1>About</h1>
        </Col>
      </Row>
      <Row>
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
