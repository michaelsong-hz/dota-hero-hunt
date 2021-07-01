import React, { useEffect, useState } from "react";
import { Button, Row } from "react-bootstrap";
import Col from "react-bootstrap/Col";

import Placeholder_icon from "images/Placeholder_icon.png";
import { GameStatus } from "models/GameStatus";
import { useStoreState } from "reducer/store";
import { heroList } from "utils/HeroList";
import { appendTheme, getIconPath } from "utils/utilities";

interface GameStatusProps {
  handleNewGame?: () => void;
}

function GameStatusBar(props: GameStatusProps): JSX.Element {
  const state = useStoreState();
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
        Array.from(state.targetHeroes).map(
          async (imageNumber) => await loadImage(imageNumber)
        )
      );
      setLoading(false);
    }

    // Skips image loading if target icons will not be shown
    if (state.gameSettings.showTargetIcons === false) {
      setLoading(false);
    } else {
      loadImages();
    }
  }, [state.gameSettings.showTargetIcons, state.targetHeroes]);

  function getNewGameButton() {
    if (state.gameStatus === GameStatus.FINISHED && props.handleNewGame) {
      return (
        <div className="mb-3">
          <Button
            className="slide-down-appear"
            variant={appendTheme("primary", state.appSettings.isDark)}
            onClick={props.handleNewGame}
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
    state.targetHeroes.forEach((targetHero) => {
      heroesToFind.push(
        <Col key={`${heroList[targetHero].name}-icon`} xs="4" md="auto">
          {state.gameSettings.showTargetIcons === true && (
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
          <h5 className="status-hero-name mb-3">{heroList[targetHero].name}</h5>
        </Col>
      );
    });
    return heroesToFind;
  }

  return (
    <div className="d-flex flex-column">
      <div>
        <h3>{state.statusText}</h3>
      </div>
      {getNewGameButton()}
      <div>
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
