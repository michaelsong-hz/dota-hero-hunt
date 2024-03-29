import {
  faCrosshairs,
  faInfinity,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { captureException } from "@sentry/react";
import localForage from "localforage";
import React, { useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  Row,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Switch from "react-switch";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import {
  GameSettingErrors,
  gridSizes,
  GridSizeTypes,
} from "models/GameSettingsType";
import { selectIsDark } from "store/application/applicationSlice";
import { changeName } from "store/application/applicationThunks";
import { selectGameSettings } from "store/game/gameSlice";
import { setSettings } from "store/game/gameThunks";
import {
  selectHostID,
  selectHostModifiedGameSettings,
} from "store/host/hostSlice";
import { modifyGameSettings } from "store/host/hostThunks";
import { StorageConstants } from "utils/constants";
import { appendTheme, checkForSettingsErrors, isClient } from "utils/utilities";

function GameSettings(): JSX.Element {
  const history = useHistory();

  const storeGameSettings = useAppSelector(selectGameSettings);
  const modifiedGameSettings = useAppSelector(selectHostModifiedGameSettings);
  const hostID = useAppSelector(selectHostID);
  const isDark = useAppSelector(selectIsDark);

  const dispatch = useAppDispatch();

  const [pointsToWinInvalid, setPointsToWinInvalid] = useState<string>();
  const [pointsToAdvanceInvalid, setPointsToAdvanceInvalid] =
    useState<string>();

  const disabled = isClient();

  // Helper function to select the right setting slice for this page
  function getSettings() {
    if (isClient()) {
      return storeGameSettings;
    } else {
      return modifiedGameSettings;
    }
  }

  // Tracks whether to animate switching between points to win states
  const prevTargetTotalScore = useRef(getSettings().targetTotalScore);
  const prevTargetTotalScore2 = useRef(getSettings().targetTotalScore);

  function getGridSizeText(): string {
    switch (getSettings().gridSize) {
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
    }
    captureException(new Error("Invalid grid size specified for settings"));
    return "";
  }

  // Checks if the target score has been toggled between a number and inf
  function targetScoreHasToggled(
    prevScore: number | null,
    currentScore: number | null
  ): boolean {
    if (
      (prevScore !== currentScore &&
        prevScore === null &&
        currentScore !== null) ||
      (prevScore !== null && currentScore === null)
    ) {
      return true;
    }
    return false;
  }

  function getPointsToWinInputClass(): string {
    // Add animation if the number of points to win is toggled between infinite
    // or a number
    let baseName = "settings-num-input";
    let willAnimate = false;
    if (
      targetScoreHasToggled(
        prevTargetTotalScore.current,
        getSettings().targetTotalScore
      )
    ) {
      willAnimate = true;
    }
    prevTargetTotalScore.current = getSettings().targetTotalScore;

    if (getSettings().targetTotalScore === null) {
      if (willAnimate) {
        baseName += " settings-win-animate-right";
      }

      return `${baseName} ${appendTheme(
        "settings-num-input-deselected",
        isDark
      )}`;
    }

    if (willAnimate) {
      baseName += " settings-win-animate-left";
    }

    return `${baseName} ${appendTheme("settings-num-input-selected", isDark)}`;
  }

  function getPointsToWinInfiniteClass(): string {
    // Add animation if the number of points to win is toggled between infinite
    // or a number
    let baseName = "settings-inf-input";
    let willAnimate = false;

    if (
      targetScoreHasToggled(
        prevTargetTotalScore2.current,
        getSettings().targetTotalScore
      )
    ) {
      willAnimate = true;
    }
    prevTargetTotalScore2.current = getSettings().targetTotalScore;

    if (getSettings().targetTotalScore !== null) {
      if (willAnimate) {
        baseName += " settings-win-animate-left";
      }
      return `${baseName} ${appendTheme(
        "settings-inf-input-deselected",
        isDark
      )}`;
    }

    if (willAnimate) {
      baseName += " settings-win-animate-right";
    }
    return `${baseName} ${appendTheme("settings-inf-input-selected", isDark)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    // Prevent form post
    e.preventDefault();

    const settingsErrors = checkForSettingsErrors(getSettings());

    if (settingsErrors.length === 0) {
      // Save the player's current settings
      dispatch(setSettings(getSettings()));
      localForage.setItem(StorageConstants.GAME_SETTINGS, getSettings());

      history.push("/");
    } else {
      settingsErrors.forEach((error) => {
        const [gameSettingsStatus, errorText] = error;
        switch (gameSettingsStatus) {
          case GameSettingErrors.INVALID_POINTS_TO_WIN:
            setPointsToWinInvalid(errorText);
            break;
          case GameSettingErrors.INVALID_POINTS_TO_ADVANCE:
            setPointsToAdvanceInvalid(errorText);
            break;
        }
      });
    }
  }

  function getInvalidJSX(invalidText: string | undefined): JSX.Element {
    if (invalidText) {
      return (
        <Row className="slide-down-appear">
          <Col>
            <p className="mt-2 mb-0 text-danger">{invalidText}</p>
          </Col>
        </Row>
      );
    }
    return <></>;
  }

  function onShowTargetIconsChange(show: boolean) {
    const currSettings = { ...getSettings() };
    currSettings.showTargetIcons = show;
    dispatch(modifyGameSettings(currSettings));
  }

  function handleGridChange(selected: string | null) {
    if (selected) {
      const selectedNumber = parseInt(selected);
      if (selectedNumber in GridSizeTypes) {
        const gridSizeType: GridSizeTypes = selectedNumber;

        const currSettings = { ...getSettings() };
        currSettings.gridSize = selectedNumber;
        currSettings.rows = gridSizes[gridSizeType].rows;
        currSettings.columns = gridSizes[gridSizeType].cols;

        dispatch(modifyGameSettings(currSettings));
      }
    }
  }

  function getPointsToWinValue(): string {
    const gameSettings = getSettings();
    if (gameSettings.targetTotalScore === null) {
      return "";
    }
    return gameSettings.targetTotalScore.toString();
  }

  function handlePointsToWinChange(pointsToWin: string | null) {
    setPointsToWinInvalid(undefined);
    const currSettings = { ...getSettings() };

    if (pointsToWin) {
      currSettings.targetTotalScore = parseInt(pointsToWin);
    } else {
      currSettings.targetTotalScore = null;
    }

    dispatch(modifyGameSettings(currSettings));
  }

  function getAdvanceRoundValue(): string {
    const gameSettings = getSettings();
    if (gameSettings.targetRoundScore === null) {
      return "";
    }
    return gameSettings.targetRoundScore.toString();
  }

  function handlePointsToAdvanceRoundChange(
    pointsToAdvanceRound: string | null
  ) {
    setPointsToAdvanceInvalid(undefined);
    const currSettings = { ...getSettings() };

    if (pointsToAdvanceRound) {
      currSettings.targetRoundScore = parseInt(pointsToAdvanceRound);
    } else {
      currSettings.targetRoundScore = null;
    }

    dispatch(modifyGameSettings(currSettings));
  }

  return (
    <div className={`${appendTheme("content-holder", isDark)} px-3 py-2`}>
      <Form onSubmit={handleSubmit}>
        <div className="d-flex">
          <div className="mr-auto">
            <h3>Game Settings{disabled === true && ` (Read Only)`}</h3>
          </div>
          <div className="d-flex settings-actions">
            {hostID !== null && (
              <div>
                <Button
                  variant={appendTheme("secondary", isDark)}
                  onClick={() => dispatch(changeName())}
                >
                  <FontAwesomeIcon icon={faTag} className="mr-1" />
                  Change Name
                </Button>
              </div>
            )}
            <div className="settings-action-start ml-2">
              <Button
                className="settings-action-start-button"
                disabled={disabled}
                variant={appendTheme("primary", isDark)}
                type="submit"
              >
                <FontAwesomeIcon icon={faCrosshairs} className="mr-1" />
                {disabled ? "Waiting to Start" : "Start Game"}
              </Button>
            </div>
          </div>
        </div>
        <Row className="mt-2">
          <Col xs="12" sm="6">
            <label>
              <span>
                <p className="mb-1">Show icon to search for</p>
              </span>
              <Switch
                disabled={disabled}
                onChange={(showTargetIcons) =>
                  onShowTargetIconsChange(showTargetIcons)
                }
                checked={getSettings().showTargetIcons}
              />
            </label>
          </Col>

          <Col xs="12" sm="6" className="mb-3">
            <p className="mb-1">Grid size</p>
            <DropdownButton
              id="grid-dropdown-button"
              disabled={disabled}
              title={getGridSizeText()}
              variant={appendTheme("secondary", isDark)}
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

          <Col xs="12" sm="6" className="mb-3">
            <p className="mb-1">Points to win</p>
            <Row className="no-gutters">
              <Col xs="auto" className="mr-2">
                <Form.Control
                  type="number"
                  className={getPointsToWinInputClass()}
                  disabled={disabled}
                  value={getPointsToWinValue()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handlePointsToWinChange(e.target.value)
                  }
                  placeholder="Inf"
                />
              </Col>
              <Col xs="auto">
                <Button
                  className={getPointsToWinInfiniteClass()}
                  variant=""
                  disabled={disabled}
                  onClick={() => handlePointsToWinChange(null)}
                >
                  <FontAwesomeIcon icon={faInfinity} />
                </Button>
              </Col>
            </Row>
            {getInvalidJSX(pointsToWinInvalid)}
          </Col>

          <Col xs="12" sm="6" className="pb-3">
            <p className="mb-1">Heroes per round</p>
            <Form.Control
              type="number"
              className="settings-num-input"
              disabled={disabled}
              value={getAdvanceRoundValue()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlePointsToAdvanceRoundChange(e.target.value)
              }
            />
            {getInvalidJSX(pointsToAdvanceInvalid)}
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default GameSettings;
