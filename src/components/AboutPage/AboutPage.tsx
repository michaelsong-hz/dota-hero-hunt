import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

function AboutPage(): JSX.Element {
  return (
    <div>
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
    </div>
  );
}

export default AboutPage;
