import React from "react";
import { Col, Row } from "react-bootstrap";

import HeroIcon from "components/GameShared/HeroIcon";
import GameStatusBar from "components/GameShared/StatusBar";
import { useStoreState } from "reducer/store";
import { heroList } from "utils/HeroList";
import { prependCDN } from "utils/utilities";

interface HeroGridProps {
  handleClick: (heroNumber: number) => void;
}

function HeroGrid(props: HeroGridProps): JSX.Element {
  const state = useStoreState();

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
    <div className="text-center">
      <GameStatusBar />
      <Row>
        <Col>{createHeroImages()}</Col>
      </Row>
    </div>
  );
}

export default HeroGrid;
