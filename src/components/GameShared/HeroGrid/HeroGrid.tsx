import React, { useEffect, useRef, useState } from "react";

import HeroIcon from "components/GameShared/HeroIcon";
import GameStatusBar from "components/GameShared/StatusBar";
import { useAppSelector } from "hooks/useStore";
import Placeholder_icon from "images/Placeholder_icon.png";
import { GameStatus } from "models/GameStatus";
import {
  selectCurrentHeroes,
  selectGameStatus,
  selectGridRowsCols,
} from "store/game/gameSlice";
import { heroList } from "utils/HeroList";
import { getIconPath } from "utils/utilities";

import HeroIconStarting from "../HeroIconStarting";

enum GridState {
  COUNTDOWN,
  LOADING_IMAGES,
  LOADED_IMAGES,
}

function HeroGrid(): JSX.Element {
  const currentHeroes = useAppSelector(selectCurrentHeroes);
  const gameStatus = useAppSelector(selectGameStatus);
  const [gameRows, gameCols] = useAppSelector(selectGridRowsCols);

  const [loading, setLoading] = useState(true);
  const isAnimatingCountdownOut = useRef(false);

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
    // Only start loading images when our array is initialized
    if (currentHeroes.length > 1) {
      loadImages();
    }
  }, [currentHeroes]);

  function createHeroImagesRow(
    rowNumber: number,
    gridState: GridState
  ): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];

    if (gridState !== GridState.COUNTDOWN) {
      for (let i = 0; i < currentHeroes[rowNumber].length; i++) {
        const heroNumber = currentHeroes[rowNumber][i];
        heroImagesRow.push(
          <HeroIcon
            key={`heroIcon-${i}`}
            src={
              gridState !== GridState.LOADED_IMAGES
                ? Placeholder_icon
                : getIconPath(heroList[heroNumber].url)
            }
            heroNumber={heroNumber}
          />
        );
      }
    } else {
      for (let i = 0; i < gameCols; i++) {
        heroImagesRow.push(<HeroIconStarting key={`iconStarting-${i}`} />);
      }
    }
    return heroImagesRow;
  }

  function createHeroImages(gridState: GridState): JSX.Element[] {
    let numRows = gameRows;
    if (gridState !== GridState.COUNTDOWN) {
      numRows = currentHeroes.length;
    }

    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < numRows; i++) {
      heroImages.push(
        <div className="d-flex justify-content-center" key={`heroIconRow${i}`}>
          {createHeroImagesRow(i, gridState)}
        </div>
      );
    }
    return heroImages;
  }

  // If leaving the page while counting down, keep the animation playing
  const prevGameStatus = useRef(gameStatus);
  if (
    prevGameStatus.current === GameStatus.PLAYING_COUNTDOWN &&
    gameStatus === GameStatus.LOBBY
  ) {
    isAnimatingCountdownOut.current = true;
  }
  prevGameStatus.current = gameStatus;

  return (
    <div className="text-center">
      <GameStatusBar />
      {gameStatus === GameStatus.PLAYING_COUNTDOWN ||
      isAnimatingCountdownOut.current === true ? (
        <div>{createHeroImages(GridState.COUNTDOWN)}</div>
      ) : (
        <>
          <div style={{ display: loading ? "block" : "none" }}>
            {createHeroImages(GridState.LOADING_IMAGES)}
          </div>
          <div
            className="fast-fade-reveal"
            style={{ display: loading ? "none" : "block" }}
          >
            {createHeroImages(GridState.LOADED_IMAGES)}
          </div>
        </>
      )}
    </div>
  );
}

export default HeroGrid;
