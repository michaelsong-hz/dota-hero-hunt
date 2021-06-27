import React from "react";
import { Container } from "react-bootstrap";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import HeroGrid from "../HeroGrid";
import SettingsButton from "../SettingsButton";

interface GamePageProps {
  handleAddSelectedIcon: (heroNumber: number) => void;
  handleEndGame?: () => void;
}

function GamePage(props: GamePageProps): JSX.Element {
  const state = useStoreState();

  return (
    <Container fluid="xl" className="mt-3">
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
          )} px-3 py-2`}
        >
          <ConnectedPlayers />
        </div>
        <div
          className={`game-page-hero-grid ${appendTheme(
            "content-holder",
            state.appSettings.isDark
          )} px-2 py-2`}
        >
          <HeroGrid handleClick={props.handleAddSelectedIcon} />
        </div>
      </div>
    </Container>
  );
}

export default GamePage;
