import React from "react";

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
        />
      );
    }
    return heroImagesRow;
  }

  function createHeroImages(): JSX.Element[] {
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < state.currentHeroes.length; i++) {
      heroImages.push(
        <div className="d-flex justify-content-center" key={`heroIconRow${i}`}>
          {createHeroImagesRow(i)}
        </div>
      );
    }
    return heroImages;
  }

  return (
    <div className="text-center">
      <GameStatusBar />
      <div className="">{createHeroImages()}</div>
    </div>
  );
}

export default HeroGrid;
