import React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

class Game extends React.Component {
  render(): JSX.Element {
    return (
      <Container>
        <Row>
          <Col>
            <p>Game</p>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Game;
