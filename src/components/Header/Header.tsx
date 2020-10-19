import React, { useContext, useState } from "react";
import {
  Navbar,
  Nav,
  OverlayTrigger,
  Button,
  Form,
  Tooltip,
} from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";

import { StoreContext } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { GlobalConstants, StorageConstants } from "utils/constants";

function Header(): JSX.Element {
  const { state, dispatch } = useContext(StoreContext);
  const [showVolume, setShowVolume] = useState(false);

  function toggleTooltip(show: boolean) {
    if (show === false) {
      localStorage.setItem(
        StorageConstants.VOLUME,
        state.appSettings.volume.toString()
      );
    }
    setShowVolume(show);
  }

  const renderTooltip = (props: unknown) => (
    <Tooltip id="button-tooltip" className="tooltip" {...props}>
      <RangeSlider
        value={state.appSettings.volume}
        onChange={(changeEvent) =>
          dispatch({
            type: StoreConstants.SET_VOLUME,
            volume: parseInt(changeEvent.target.value),
          })
        }
        step={GlobalConstants.VOLUME_STEP}
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
          show={showVolume}
          onToggle={(show: boolean) => toggleTooltip(show)}
        >
          <Button className="mr-3" variant="secondary">
            Volume
          </Button>
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
