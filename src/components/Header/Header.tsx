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
import { Link } from "react-router-dom";

import { useStoreState, useStoreDispatch } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { GlobalConstants, StorageConstants } from "utils/constants";
import { appendTheme } from "utils/utilities";

function Header(): JSX.Element {
  const state = useStoreState();
  const dispatch = useStoreDispatch();
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

  function toggleTheme(isDark: boolean) {
    dispatch({
      type: StoreConstants.SET_THEME,
      isDark,
    });
    localStorage.setItem(StorageConstants.THEME_IS_DARK, isDark.toString());
  }

  return (
    <Navbar bg={appendTheme("header", state.appSettings.isDark)} expand="lg">
      <Link
        to="/"
        className={`navbar-brand ${appendTheme(
          "text",
          !state.appSettings.isDark
        )}`}
      >
        Dota Hero Hunt
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Link to="/" className="nav-link text-muted">
            Home
          </Link>
          <Link to="/about" className="nav-link text-muted">
            About
          </Link>
        </Nav>
        <OverlayTrigger
          placement="bottom"
          trigger="click"
          overlay={renderTooltip}
          show={showVolume}
          onToggle={(show: boolean) => toggleTooltip(show)}
        >
          <Button
            className="mr-3"
            variant={appendTheme("secondary", state.appSettings.isDark)}
          >
            Volume
          </Button>
        </OverlayTrigger>
        <Form inline>
          <Form.Check
            className={appendTheme("text", !state.appSettings.isDark)}
            inline
            type="switch"
            id="theme-switch"
            label="Toggle Theme"
            checked={state.appSettings.isDark}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              toggleTheme(e.target.checked)
            }
          ></Form.Check>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
