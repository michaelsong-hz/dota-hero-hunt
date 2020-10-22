import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { useStoreState } from "reducer/store";
import { heroList } from "utils/HeroList";
import { prependCDN } from "utils/utilities";

function GameStatusBar(): JSX.Element {
  const state = useStoreState();

  function renderHeroesToFind(): JSX.Element[] {
    const heroesToFind: JSX.Element[] = [];
    state.targetHeroes.forEach((targetHero) => {
      heroesToFind.push(
        <Col key={`${heroList[targetHero].name}-icon`} xs="auto">
          {state.gameSettings.showTargetIcons === true && (
            <img
              className="status-hero-icon"
              src={prependCDN(heroList[targetHero].url)}
              alt={`${heroList[targetHero].name} icon`}
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
        <Row className="justify-content-center">{renderHeroesToFind()}</Row>
      </Col>
    </Row>
  );
}

export default GameStatusBar;
