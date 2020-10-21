import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";
import { faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import Switch from "react-switch";

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
    <Navbar
      className="navbar-expand-sm"
      bg={appendTheme("header", state.appSettings.isDark)}
      expand="lg"
    >
      <Link
        to="/"
        className={`navbar-brand ${appendTheme(
          "text",
          !state.appSettings.isDark
        )}`}
        data-toggle="collapse"
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
          rootClose
          placement="bottom"
          trigger="click"
          overlay={renderTooltip}
          show={showVolume}
          onToggle={(show: boolean) => toggleTooltip(show)}
        >
          <Button
            className="mr-1 header-btn"
            variant={appendTheme("navbar-brand", state.appSettings.isDark)}
          >
            <div className="text-muted">
              {state.appSettings.volume > 0 ? (
                <FontAwesomeIcon icon={faVolumeUp} />
              ) : (
                <FontAwesomeIcon icon={faVolumeMute} />
              )}
            </div>
          </Button>
        </OverlayTrigger>
        <Form inline>
          <label>
            <Switch
              className={
                state.appSettings.isDark
                  ? "header-switch-on"
                  : "header-switch-off"
              }
              height={24}
              width={50}
              handleDiameter={22}
              onChange={(checked: boolean) => toggleTheme(checked)}
              checked={state.appSettings.isDark}
              checkedIcon={
                <div
                  style={{
                    color: "#dddddd",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <FontAwesomeIcon icon={faMoon} />
                </div>
              }
              uncheckedIcon={
                <div
                  style={{
                    color: "#dddddd",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <FontAwesomeIcon icon={faSun} />
                </div>
              }
              aria-label="toggle dark theme"
            />
          </label>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
