import React, { useEffect, useState } from "react";

import HeroIcon from "components/GameShared/HeroIcon";
import GameStatusBar from "components/GameShared/StatusBar";
import Placeholder_icon from "images/Placeholder_icon.png";
import { useStoreState } from "reducer/store";
import { heroList } from "utils/HeroList";
import { prependCDN } from "utils/utilities";

interface HeroGridProps {
  handleClick: (heroNumber: number) => void;
}

function HeroGrid(props: HeroGridProps): JSX.Element {
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
        state.currentHeroes.map(
          async (heroRow) =>
            await Promise.all(
              heroRow.map(async (imageNumber) => await loadImage(imageNumber))
            )
        )
      );
      setLoading(false);
    }
    loadImages();
  }, [state.currentHeroes]);

  function createHeroImagesRow(
    rowNumber: number,
    loadingImages: boolean
  ): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];

    for (let i = 0; i < state.currentHeroes[rowNumber].length; i++) {
      const heroNumber = state.currentHeroes[rowNumber][i];
      heroImagesRow.push(
        <HeroIcon
          key={`heroIcon${i}`}
          src={
            loadingImages
              ? Placeholder_icon
              : prependCDN(heroList[heroNumber].url)
          }
          heroNumber={heroNumber}
          onClick={() => props.handleClick(heroNumber)}
        />
      );
    }
    return heroImagesRow;
  }

  function createHeroImages(loadingImages: boolean): JSX.Element[] {
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < state.currentHeroes.length; i++) {
      heroImages.push(
        <div className="d-flex justify-content-center" key={`heroIconRow${i}`}>
          {createHeroImagesRow(i, loadingImages)}
        </div>
      );
    }
    return heroImages;
  }

  return (
    <div className="text-center">
      <GameStatusBar />
      <div style={{ display: loading ? "block" : "none" }}>
        {createHeroImages(true)}
      </div>
      <div
        className="fast-fade-reveal"
        style={{ display: loading ? "none" : "block" }}
      >
        {createHeroImages(false)}
      </div>
    </div>
  );
}

export default HeroGrid;
