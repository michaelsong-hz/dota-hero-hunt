import { isNull, isNullOrUndefined } from "util";

import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

let playerName: string | undefined;
class Home extends React.Component {
  constructor(props: any) {
    super(props);
    const storedPlayerName = localStorage.getItem("playerName");
    if (!isNull(storedPlayerName)) {
      playerName = storedPlayerName;
    }
    console.log("playername is", playerName);
  }

  handleClick() {
    if (isNullOrUndefined(playerName)) {
      console.log("invalid playername");
    } else {
      console.log("hi", playerName);
      localStorage.setItem("playerName", playerName);
    }
  }

  render(): JSX.Element {
    return (
      <Container>
        <Row>
          <Col>
            <Form>
              <Form.Group>
                <Form.Label>Player Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  defaultValue={playerName}
                  onChange={(e) => (playerName = e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={() => this.handleClick()}>
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Home;
