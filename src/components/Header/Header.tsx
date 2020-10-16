import React, { useState } from "react";
import {
  Navbar,
  Nav,
  OverlayTrigger,
  Button,
  Form,
  Tooltip,
} from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";

function Header(): JSX.Element {
  const [volume, setVolume] = useState(50);

  const renderTooltip = (props: any) => (
    <Tooltip
      id="button-tooltip"
      className="tooltip"
      style={{ backgroundColor: "#4A7EFA" }}
      {...props}
    >
      <RangeSlider
        value={volume}
        onChange={(changeEvent) =>
          setVolume(parseInt(changeEvent.target.value))
        }
      />
    </Tooltip>
  );

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">Dota Hero Hunt</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/about">About</Nav.Link>
        </Nav>
        <OverlayTrigger
          placement="bottom"
          trigger="click"
          overlay={renderTooltip}
        >
          <Button className="mr-3">Volume</Button>
        </OverlayTrigger>
        <Form inline>
          <Form.Check
            inline
            type="switch"
            id="theme-switch"
            label="Toggle Theme"
          ></Form.Check>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
