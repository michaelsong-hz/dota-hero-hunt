import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useParams } from "react-router-dom";

function ConnectionPage(): JSX.Element {
  const { hostID } = useParams();
  let playerName = localStorage.getItem("playerName") || "";
  // useEffect(() => {
  // });
  function submit() {
    console.log("submit");
  }

  return (
    <Container>
      <Row>
        <Col>
          <h2>Connecting to game session {hostID}</h2>
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
          </Form>
          <Button variant="primary" onClick={() => submit()}>
            Submit
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default ConnectionPage;
