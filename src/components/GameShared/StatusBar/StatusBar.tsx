import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { useStoreState } from "reducer/store";
import { heroList } from "utils/HeroList";

function GameStatusBar(): JSX.Element {
  const state = useStoreState();

  function renderHeroesToFind(): JSX.Element[] {
    const heroesToFind: JSX.Element[] = [];
    state.targetHeroes.forEach((targetHero) => {
      heroesToFind.push(
        <Col key={`${heroList[targetHero].name}-icon`} xs="auto">
          <p>{heroList[targetHero].name}</p>
        </Col>
      );
    });
    return heroesToFind;
  }

  return (
    <Row className="justify-content-center">
      {state.gameSettings.targetRoundScore === state.selectedIcons.size ? (
        <Col>
          <p>All heroes found! Get ready for the next round...</p>
        </Col>
      ) : (
        renderHeroesToFind()
      )}
    </Row>
  );
}

export default GameStatusBar;
