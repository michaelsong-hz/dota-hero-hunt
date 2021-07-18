import React from "react";
import { Container } from "react-bootstrap";

import { useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { selectIsDark } from "store/application/applicationSlice";
import { selectGameStatus } from "store/game/gameSlice";
import { heroList } from "utils/HeroList";
import { appendTheme, getIconPath } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import HeroGrid from "../HeroGrid";
import HeroIconWinning from "../HeroIconWinning";
import SettingsButton from "../SettingsButton";

function GamePage(): JSX.Element {
  const gameStatus = useAppSelector(selectGameStatus);
  const isDark = useAppSelector(selectIsDark);

  function getWinningIcons() {
    if (gameStatus !== GameStatus.FINISHED) {
      return [];
    }
    const winningIcons = [];
    for (let i = 0; i < Math.ceil(window.innerHeight / 10); i++) {
      const heroNumber = Math.floor(Math.random() * heroList.length);
      winningIcons.push(
        <HeroIconWinning
          key={`winHeroIcon${i}`}
          src={getIconPath(heroList[heroNumber].url)}
          heroNumber={heroNumber}
        />
      );
    }
    return winningIcons;
  }

  return (
    <Container fluid="xl" className="mt-3">
      {getWinningIcons()}
      <div className="d-flex flex-row-reverse mb-3">
        <SettingsButton />
      </div>
      <div className="game-page-panels d-flex">
        <div className={`${appendTheme("content-holder", isDark)}`}>
          <ConnectedPlayers />
        </div>
        <div
          className={`game-page-hero-grid ${appendTheme(
            "content-holder",
            isDark
          )} px-2 py-2`}
        >
          <HeroGrid />
        </div>
      </div>
    </Container>
  );
}

export default GamePage;
