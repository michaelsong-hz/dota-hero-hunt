import React, { useContext } from "react";
import { Col, Row } from "react-bootstrap";

import GameStatusBar from "components/GameStatusBar";
import HeroIcon from "components/HeroIcon";
import { GameStatusContext } from "reducer/GameStatusContext";
import { heroList } from "utils/HeroList";
import { prependCDN } from "utils/utilities";

interface HeroGridProps {
  handleClick: (heroNumber: number) => void;
}

function HeroGrid(props: HeroGridProps): JSX.Element {
  const { state } = useContext(GameStatusContext);

  function createHeroImagesRow(rowNumber: number): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];

    for (let i = 0; i < state.currentHeroes[rowNumber].length; i++) {
      const heroNumber = state.currentHeroes[rowNumber][i];
      heroImagesRow.push(
        <HeroIcon
          key={`heroIcon${i}`}
          src={prependCDN(heroList[heroNumber].url)}
          onClick={() => props.handleClick(heroNumber)}
          heroNumber={heroNumber}
          selectedIcons={state.selectedIcons}
        />
      );
    }
    return heroImagesRow;
  }

  function createHeroImages(): JSX.Element[] {
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < state.currentHeroes.length; i++) {
      heroImages.push(
        <Row key={`heroIconRow${i}`}>
          <Col>{createHeroImagesRow(i)}</Col>
        </Row>
      );
    }
    return heroImages;
  }

  return (
    <Col>
      <GameStatusBar />
      <Row>
        <Col>{createHeroImages()}</Col>
      </Row>
    </Col>
  );
}

export default HeroGrid;
