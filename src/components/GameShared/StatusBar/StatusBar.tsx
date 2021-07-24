import React, { useEffect, useState } from "react";
import { Button, Row } from "react-bootstrap";
import Col from "react-bootstrap/Col";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import Placeholder_icon from "images/Placeholder_icon.png";
import { GameStatus } from "models/GameStatus";
import { selectIsDark } from "store/application/applicationSlice";
import {
  selectGameSettings,
  selectGameStatus,
  selectStatusText,
  selectTargetHeroes,
} from "store/game/gameSlice";
import { incrementRound } from "store/host/hostThunks";
import { heroList } from "utils/HeroList";
import { appendTheme, getIconPath, isClient } from "utils/utilities";

function GameStatusBar(): JSX.Element {
  const targetHeroes = useAppSelector(selectTargetHeroes);
  const gameSettings = useAppSelector(selectGameSettings);
  const gameStatus = useAppSelector(selectGameStatus);
  const statusText = useAppSelector(selectStatusText);

  const isDark = useAppSelector(selectIsDark);

  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  // Loads new icons if the current ones are changed
  // Sets loading to true while icons are loading to display local placeholder
  useEffect(() => {
    const loadImage = (heroNumber: number) => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image();
        loadImg.src = getIconPath(heroList[heroNumber].url);
        loadImg.onload = () => resolve(getIconPath(heroList[heroNumber].url));
        // TODO: Handle cases where images don't load
        loadImg.onerror = (err: unknown) => reject(err);
      });
    };

    async function loadImages() {
      setLoading(true);
      await Promise.all(
        Array.from(targetHeroes).map(
          async (imageNumber) => await loadImage(imageNumber)
        )
      );
      setLoading(false);
    }

    // Skips image loading if target icons will not be shown
    if (gameSettings.showTargetIcons === false) {
      setLoading(false);
    } else {
      loadImages();
    }
  }, [gameSettings.showTargetIcons, targetHeroes]);

  function getNewGameButton() {
    if (gameStatus === GameStatus.FINISHED && !isClient()) {
      return (
        <div className="mb-3">
          <Button
            size="lg"
            className="slide-down-appear"
            variant={appendTheme("primary", isDark)}
            onClick={() => dispatch(incrementRound(1))}
          >
            New Game
          </Button>
        </div>
      );
    }
    return <></>;
  }

  function renderHeroesToFind(loadingIcons: boolean): JSX.Element[] {
    const heroesToFind: JSX.Element[] = [];
    targetHeroes.forEach((targetHero, i) => {
      // Force text to break-wrap on the rightmost column
      let textBreak = "";
      if (i % 3 === 2) textBreak = "text-break";

      heroesToFind.push(
        <Col key={`${heroList[targetHero].name}-icon`} xs="4" md="4" lg="auto">
          {gameSettings.showTargetIcons === true && (
            <img
              className="status-hero-icon fast-fade-reveal"
              src={
                loadingIcons
                  ? Placeholder_icon
                  : getIconPath(heroList[targetHero].url)
              }
              alt={`${heroList[targetHero].name} icon`}
              draggable="false"
            ></img>
          )}
          <h5 className={`status-hero-name mb-3 ${textBreak}`}>
            {heroList[targetHero].name}
          </h5>
        </Col>
      );
    });
    return heroesToFind;
  }

  let statusBarClass = "status-bar";
  if (gameSettings.showTargetIcons === false)
    statusBarClass = "status-bar-no-icons";

  return (
    <div className={`d-flex flex-column ${statusBarClass}`}>
      <div className="status-bar-text">
        <h3>{statusText}</h3>
      </div>
      {getNewGameButton()}
      <div className="text-wrap">
        <Row
          className="justify-content-center"
          style={{ display: loading ? "flex" : "none" }}
        >
          {renderHeroesToFind(true)}
        </Row>
        <Row
          className="justify-content-center"
          style={{ display: loading ? "none" : "flex" }}
        >
          {renderHeroesToFind(false)}
        </Row>
      </div>
    </div>
  );
}

export default GameStatusBar;
