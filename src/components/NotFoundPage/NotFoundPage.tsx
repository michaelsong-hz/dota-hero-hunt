import React from "react";
import { Button, Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useHistory } from "react-router-dom";

import { useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { appendTheme } from "utils/utilities";

function PageNotFound(): JSX.Element {
  const history = useHistory();
  const isDark = useAppSelector(selectIsDark);

  return (
    <Container className="my-4 text-center">
      <Row>
        <Col xs="12">
          <h1 className="display-3">404 Not Found</h1>
        </Col>
        <Col xs="12" className="mt-2">
          <p>
            The requested page could not be found. Either the link you followed
            was incorrect, or the page has been removed.
          </p>
        </Col>
        <Col xs="12" className="mt-2">
          <Button
            size="lg"
            variant={appendTheme("primary", isDark)}
            onClick={() => history.push("/")}
          >
            Return Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default PageNotFound;
