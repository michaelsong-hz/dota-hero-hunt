import React from "react";
import { Container } from "react-bootstrap";

import { GameStatus } from "models/GameStatus";
import { useStoreState } from "reducer/store";
import { heroList } from "utils/HeroList";
import { appendTheme, getIconPath } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import HeroGrid from "../HeroGrid";
import HeroIconWinning from "../HeroIconWinning";
import SettingsButton from "../SettingsButton";

interface GamePageProps {
  handleAddSelectedIcon: (heroNumber: number) => void;
  handleNewGame?: () => void;
  handleEndGame?: () => void;
}

function GamePage(props: GamePageProps): JSX.Element {
  const state = useStoreState();

  function getWinningIcons() {
    if (state.gameStatus !== GameStatus.FINISHED) {
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
      {props.handleEndGame && (
        <div className="d-flex flex-row-reverse mb-3">
          <SettingsButton handleClick={props.handleEndGame}></SettingsButton>
        </div>
      )}
      <div className="game-page-panels d-flex">
        <div
          className={`${appendTheme(
            "content-holder",
            state.appSettings.isDark
          )}`}
        >
          <ConnectedPlayers />
        </div>
        <div
          className={`game-page-hero-grid ${appendTheme(
            "content-holder",
            state.appSettings.isDark
          )} px-2 py-2`}
        >
          <HeroGrid
            handleClick={props.handleAddSelectedIcon}
            handleNewGame={props.handleNewGame}
          />
        </div>
      </div>
    </Container>
  );
}

export default GamePage;
