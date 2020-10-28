import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import Placeholder_icon from "images/Placeholder_icon.png";
import { useStoreState } from "reducer/store";
import { heroList } from "utils/HeroList";
import { prependCDN } from "utils/utilities";

function GameStatusBar(): JSX.Element {
  const state = useStoreState();
  const [loading, setLoading] = useState(true);

  // Loads new icons if the current ones are changed
  // Sets loading to true while icons are loading to display local placeholder
  useEffect(() => {
    const loadImage = (heroNumber: number) => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image();
        loadImg.src = prependCDN(heroList[heroNumber].url);
        loadImg.onload = () => resolve(prependCDN(heroList[heroNumber].url));
        loadImg.onerror = (err) => reject(err);
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

  function renderHeroesToFind(loadingIcons: boolean): JSX.Element[] {
    const heroesToFind: JSX.Element[] = [];
    state.targetHeroes.forEach((targetHero) => {
      heroesToFind.push(
        <Col key={`${heroList[targetHero].name}-icon`} xs="auto">
          {state.gameSettings.showTargetIcons === true && (
            <img
              className="status-hero-icon fast-fade-reveal"
              src={
                loadingIcons
                  ? Placeholder_icon
                  : prependCDN(heroList[targetHero].url)
              }
              alt={`${heroList[targetHero].name} icon`}
              draggable="false"
            ></img>
          )}
          <h5 className="mb-3">{heroList[targetHero].name}</h5>
        </Col>
      );
    });
    return heroesToFind;
  }

  return (
    <Row>
      <Col xs="12">
        {state.gameSettings.targetRoundScore === state.selectedIcons.size ? (
          <h3>All heroes found! Get ready for the next round...</h3>
        ) : (
          <h3>Find the following heroes:</h3>
        )}
      </Col>
      <Col xs="12">
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
      </Col>
    </Row>
  );
}

export default GameStatusBar;
