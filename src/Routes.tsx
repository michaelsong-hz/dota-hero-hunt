import { useMediaQuery } from "@react-hook/media-query";
import React, { useRef } from "react";
import { Switch, Route, useLocation } from "react-router-dom";
import { animated, useTransition } from "react-spring";

import AboutPage from "components/AboutPage";
import GameClientPage from "components/GameClient/GameClientPage";
import GameHostPage from "components/GameHost/GameHostPage";
import HeroIconWinning from "components/GameShared/HeroIconWinning";
import LobbyView from "components/GameShared/LobbyView";
import LoadStore from "components/LoadStore";
import NotFoundPage from "components/NotFoundPage";
import { useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { selectGameStatus } from "store/game/gameSlice";
import { heroList } from "utils/HeroList";
import { MediaQueries } from "utils/constants";
import { getGlobalTransitions, getIconPath } from "utils/utilities";

function Routes(): JSX.Element {
  const location = useLocation();
  const isSMPlus = useMediaQuery(MediaQueries.SM);

  const prevLocationRef = useRef<string>(location.pathname);
  const transitions = useTransition(
    location,
    getGlobalTransitions(
      isSMPlus,
      location.pathname === "/",
      // Disable animation when leaving a game as the board resets and looks
      // janky
      prevLocationRef.current.split("/")[1] === "play" &&
        location.pathname === "/"
    )
  );
  prevLocationRef.current = location.pathname;

  const gameStatus = useAppSelector(selectGameStatus);
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
    <LoadStore>
      {/* Winning icons need to be outside of the react-spring transitions
      or their position gets messed up */}
      <div>{getWinningIcons()}</div>
      {transitions((props, item) => (
        <animated.div style={props}>
          <Switch location={item}>
            <Route path="/play/:remoteHostID">
              <GameClientPage />
            </Route>
            <Route path="/about">
              <AboutPage />
            </Route>
            <Route exact path="/settings">
              <LobbyView />
            </Route>
            <Route exact path="/">
              <GameHostPage />
            </Route>
            <Route component={NotFoundPage}>
              <NotFoundPage />
            </Route>
          </Switch>
        </animated.div>
      ))}
    </LoadStore>
  );
}

export default Routes;
