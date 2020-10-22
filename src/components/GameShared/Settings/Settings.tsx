import { faInfinity } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import Switch from "react-switch";

import { gridSizes, GridSizeTypes } from "models/GameSettingsType";
import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { appendTheme } from "utils/utilities";

interface GameSettingsProps {
  inviteLink: string;
  disabled: boolean;
  startGame?: () => void;
  changeName: () => void;
}

function GameSettings(props: GameSettingsProps): JSX.Element {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  function getGridSizeText(): string {
    switch (state.gameSettings.gridSize) {
      case GridSizeTypes.SMALL: {
        return "Small";
      }
      case GridSizeTypes.MEDIUM: {
        return "Medium";
      }
      case GridSizeTypes.LARGE: {
        return "Large (Horizontal)";
      }
      case GridSizeTypes.LARGE_SQUARE: {
        return "Large";
      }
      default: {
        // TODO: Throw error
        break;
      }
    }
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();

    if (props.startGame) {
      props.startGame();
    }
  }

  function onShowTargetIconsChange(show: boolean) {
    const currSettings = { ...state.gameSettings };
    currSettings.showTargetIcons = show;
    dispatch({ type: StoreConstants.SET_SETTINGS, gameSettings: currSettings });
  }

  function handleGridChange(selected: string | null) {
    if (selected) {
      const selectedNumber = parseInt(selected);
      if (selectedNumber in GridSizeTypes) {
        const gridSizeType: GridSizeTypes = selectedNumber;

        const currSettings = { ...state.gameSettings };
        currSettings.gridSize = selectedNumber;
        currSettings.rows = gridSizes[gridSizeType].rows;
        currSettings.columns = gridSizes[gridSizeType].cols;

        dispatch({
          type: StoreConstants.SET_SETTINGS,
          gameSettings: currSettings,
        });
      }
    }
  }

  function getPointsToWinValue(): string {
    if (state.gameSettings.targetTotalScore === null) {
      return "";
    }
    return state.gameSettings.targetTotalScore.toString();
  }

  function handlePointsToWinChange(pointsToWin: string | null) {
    const currSettings = { ...state.gameSettings };

    if (pointsToWin) {
      currSettings.targetTotalScore = parseInt(pointsToWin);
    } else {
      currSettings.targetTotalScore = null;
    }

    dispatch({ type: StoreConstants.SET_SETTINGS, gameSettings: currSettings });
  }

  function handlePointsToAdvanceRoundChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const currSettings = { ...state.gameSettings };
    currSettings.targetRoundScore = parseInt(e.target.value);
    dispatch({ type: StoreConstants.SET_SETTINGS, gameSettings: currSettings });
  }

  return (
    <Col>
      <Col
        className={`${appendTheme(
          "content-holder",
          state.appSettings.isDark
        )} pt-2 mt-3`}
      >
        <Form onSubmit={handleSubmit}>
          <Row className="no-gutters">
            <Col xs="auto" className="mr-auto">
              <h3>Game Settings{props.disabled === true && ` (Read Only)`}</h3>
            </Col>
            {props.disabled === false && (
              <Col xs="auto" className="mr-2 mt-1">
                <Button
                  variant={appendTheme("secondary", state.appSettings.isDark)}
                  onClick={props.changeName}
                >
                  Change Name
                </Button>
              </Col>
            )}
            <Col xs="auto" className="mt-1">
              <Button
                disabled={props.disabled}
                variant={appendTheme("primary", state.appSettings.isDark)}
                type="submit"
              >
                {props.disabled ? "Waiting to Start" : "Start Game"}
              </Button>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col xs="12" md="6">
              <label>
                <span>
                  <p className="mb-1">Show Icon to Search For</p>
                </span>
                <Switch
                  disabled={props.disabled}
                  onChange={(showTargetIcons) =>
                    onShowTargetIconsChange(showTargetIcons)
                  }
                  checked={state.gameSettings.showTargetIcons}
                />
              </label>
            </Col>

            <Col xs="12" md="6" className="mb-3">
              <p className="mb-1">Grid Size</p>
              <DropdownButton
                id="grid-dropdown-button"
                disabled={props.disabled}
                title={getGridSizeText()}
                variant={appendTheme("secondary", state.appSettings.isDark)}
              >
                <Dropdown.Item
                  eventKey={GridSizeTypes.SMALL.toString()}
                  onSelect={(e) => handleGridChange(e)}
                >
                  Small
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey={GridSizeTypes.MEDIUM.toString()}
                  onSelect={(e) => handleGridChange(e)}
                >
                  Medium
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey={GridSizeTypes.LARGE_SQUARE.toString()}
                  onSelect={(e) => handleGridChange(e)}
                >
                  Large
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey={GridSizeTypes.LARGE.toString()}
                  onSelect={(e) => handleGridChange(e)}
                >
                  Large (Horizontal)
                </Dropdown.Item>
              </DropdownButton>
            </Col>

            <Col xs="12" md="6" className="mb-3">
              <p className="mb-1">Points to Win</p>
              <Row className="no-gutters">
                <Col xs="auto" className="mr-2">
                  <Form.Control
                    type="number"
                    className="settings-num-input"
                    disabled={props.disabled}
                    value={getPointsToWinValue()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handlePointsToWinChange(e.target.value)
                    }
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant={appendTheme("secondary", state.appSettings.isDark)}
                    disabled={props.disabled}
                    onClick={() => handlePointsToWinChange(null)}
                  >
                    <FontAwesomeIcon icon={faInfinity} />
                  </Button>
                </Col>
              </Row>
            </Col>

            <Col xs="12" md="6" className="pb-3">
              <p className="mb-1">Points to Advance Round</p>
              <Form.Control
                type="number"
                className="settings-num-input"
                disabled={props.disabled}
                value={state.gameSettings.targetRoundScore}
                onChange={handlePointsToAdvanceRoundChange}
              />
            </Col>
          </Row>
        </Form>
      </Col>
    </Col>
  );
}

export default GameSettings;
