import React from "react";
import { Container } from "react-bootstrap";

import { useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { isSinglePlayer } from "store/host/hostSlice";
import { appendTheme } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import HeroGrid from "../HeroGrid";
import SettingsButton from "../SettingsButton";
import TargetScore from "../TargetScore";

function GamePage(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);
  const isSingleP = useAppSelector(isSinglePlayer);

  return (
    <Container fluid="xl" className="mt-3">
      <div className="game-page-header d-flex flex-row mb-3">
        <div className="mr-auto">
          <TargetScore />
        </div>
        <SettingsButton />
      </div>
      <div className="game-page-panels d-flex">
        {!isSingleP && (
          <div className={`${appendTheme("content-holder", isDark)}`}>
            <ConnectedPlayers />
          </div>
        )}
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
