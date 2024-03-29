import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";
import { faVolumeUp, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import localForage from "localforage";
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
import { Link, useLocation } from "react-router-dom";
import Switch from "react-switch";

import { useAppSelector, useAppDispatch } from "hooks/useStore";
import HeroHuntIcon from "images/HeroHuntIcon.svg";
import { selectIsDark, selectVolume } from "store/application/applicationSlice";
import { setVolume, setIsDark } from "store/application/applicationThunks";
import { selectRemoteHostID } from "store/client/clientSlice";
import { GlobalConstants, StorageConstants } from "utils/constants";
import { appendTheme } from "utils/utilities";

function Header(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);
  const volume = useAppSelector(selectVolume);
  const remoteHostID = useAppSelector(selectRemoteHostID);

  const dispatch = useAppDispatch();
  const location = useLocation();

  const [showVolume, setShowVolume] = useState(false);

  // Hosts and clients have a different root
  let rootPath = "/";
  if (remoteHostID !== null) {
    rootPath = `/play/${remoteHostID}`;
  }

  // Don't navigate to the same route again if we're already there
  function shouldNavigateOnClick(to: string) {
    if (to === location.pathname) return false;
    return true;
  }

  function toggleTooltip(show: boolean) {
    if (show === false) {
      localForage.setItem(StorageConstants.VOLUME, volume);
    }
    setShowVolume(show);
  }

  const renderVolumeTooltip = (props: unknown) => (
    <Tooltip id="button-tooltip" className="tooltip" {...props}>
      <RangeSlider
        tooltipLabel={(currentValue) => `${currentValue}%`}
        tooltipPlacement="top"
        value={volume}
        onChange={(changeEvent) => {
          dispatch(setVolume(changeEvent.target.value));
        }}
        step={GlobalConstants.VOLUME_STEP}
      />
    </Tooltip>
  );

  function toggleTheme(isDark: boolean) {
    dispatch(setIsDark(isDark));
    localForage.setItem(StorageConstants.THEME_IS_DARK, isDark);
  }

  function getHeaderSecondaryClass(): string {
    if (isDark) {
      return "header-secondary";
    }
    return "text-muted";
  }

  return (
    <Navbar bg={appendTheme("header", isDark)} expand="sm">
      <Link
        to={rootPath}
        onClick={
          shouldNavigateOnClick(rootPath) === true
            ? undefined
            : (event) => event.preventDefault()
        }
      >
        <Navbar.Brand
          className={`align-middle font-weight-bold ${appendTheme(
            "text",
            !isDark
          )}`}
        >
          <img
            alt="Dota Hero Hunt logo"
            width="30"
            height="30"
            src={HeroHuntIcon}
            className="mr-2"
          />
          <span>Dota Hero Hunt</span>
        </Navbar.Brand>
      </Link>

      <Navbar.Toggle
        label="Toggle navigation"
        className={
          isDark ? "navbar-toggle navbar-toggle-dark" : "navbar-toggle"
        }
      />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Link
            to="/about"
            className={`nav-link ${getHeaderSecondaryClass()}`}
            onClick={
              shouldNavigateOnClick("/about") === true
                ? undefined
                : (event) => event.preventDefault()
            }
          >
            About
          </Link>
        </Nav>
        <OverlayTrigger
          rootClose
          placement="bottom"
          trigger="click"
          overlay={renderVolumeTooltip}
          show={showVolume}
          onToggle={(show: boolean) => toggleTooltip(show)}
        >
          <Button
            className="mr-1 header-btn"
            variant={appendTheme("navbar-brand", isDark)}
          >
            <div className={getHeaderSecondaryClass()}>
              {volume > 0 ? (
                <FontAwesomeIcon icon={faVolumeUp} />
              ) : (
                <FontAwesomeIcon icon={faVolumeMute} />
              )}
            </div>
          </Button>
        </OverlayTrigger>
        <Form inline className="header-switch-wrapper">
          <label>
            <Switch
              className={isDark ? "header-switch-on" : "header-switch-off"}
              height={24}
              width={50}
              handleDiameter={22}
              onChange={(checked: boolean) => toggleTheme(checked)}
              checked={isDark}
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
