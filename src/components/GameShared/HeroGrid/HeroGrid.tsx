import React, { useEffect, useMemo, useState } from "react";

import HeroIcon from "components/GameShared/HeroIcon";
import GameStatusBar from "components/GameShared/StatusBar";
import { useAppSelector } from "hooks/useStore";
import Placeholder_icon from "images/Placeholder_icon.png";
import {
  selectCurrentHeroes,
  selectInvalidIcons,
  selectSelectedIcons,
} from "store/game/gameSlice";
import { heroList } from "utils/HeroList";
import { getIconPath } from "utils/utilities";

function HeroGrid(): JSX.Element {
  const currentHeroes = useAppSelector(selectCurrentHeroes);
  const invalidIcons = useAppSelector(selectInvalidIcons);
  const selectedIcons = useAppSelector(selectSelectedIcons);

  const [loading, setLoading] = useState(true);

  // Pre-compute these into a set so that each HeroIcon doesn't have to
  const invalidIconsSet = useMemo(() => new Set(invalidIcons), [invalidIcons]);
  const selectedIconsSet = useMemo(
    () => new Set(selectedIcons),
    [selectedIcons]
  );

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
        currentHeroes.map(
          async (heroRow) =>
            await Promise.all(
              heroRow.map(async (imageNumber) => await loadImage(imageNumber))
            )
        )
      );
      setLoading(false);
    }
    loadImages();
  }, [currentHeroes]);

  function createHeroImagesRow(
    rowNumber: number,
    loadingImages: boolean
  ): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];

    for (let i = 0; i < currentHeroes[rowNumber].length; i++) {
      const heroNumber = currentHeroes[rowNumber][i];
      heroImagesRow.push(
        <HeroIcon
          key={`heroIcon${i}`}
          src={
            loadingImages
              ? Placeholder_icon
              : getIconPath(heroList[heroNumber].url)
          }
          heroNumber={heroNumber}
          invalidIcons={invalidIconsSet}
          selectedIcons={selectedIconsSet}
        />
      );
    }
    return heroImagesRow;
  }

  function createHeroImages(loadingImages: boolean): JSX.Element[] {
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < currentHeroes.length; i++) {
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
