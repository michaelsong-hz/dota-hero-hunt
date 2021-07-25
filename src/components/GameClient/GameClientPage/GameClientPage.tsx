import { useMediaQuery } from "@react-hook/media-query";
import React from "react";
import { Container } from "react-bootstrap";
import { animated, useTransition } from "react-spring";

import ConnectionView from "components/GameClient/ConnectionView";
import GamePage from "components/GameShared/GamePage";
import LobbyView from "components/GameShared/LobbyView";
import { useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { selectRemoteHostID } from "store/client/clientSlice";
import { selectGameStatus } from "store/game/gameSlice";
import { MediaQueries } from "utils/constants";
import { getGlobalTransitions } from "utils/utilities";

enum ClientViews {
  CONNECTION,
  LOBBY,
  GAME,
}

function GameClientPage(): JSX.Element {
  const remoteHostID = useAppSelector(selectRemoteHostID);
  const gameStatus = useAppSelector(selectGameStatus);

  const isSMPlus = useMediaQuery(MediaQueries.SM);

  let view = ClientViews.GAME;
  if (remoteHostID === null) {
    view = ClientViews.CONNECTION;
  }
  // Game lobby
  if (gameStatus === GameStatus.LOBBY) {
    view = ClientViews.LOBBY;
  }

  const transitions = useTransition(
    view,
    getGlobalTransitions(isSMPlus, view === ClientViews.GAME)
  );

  return (
    <>
      {transitions((props, item) => {
        if (item === ClientViews.CONNECTION)
          return (
            <animated.div style={props}>
              <Container className="mt-4">
                <ConnectionView />
              </Container>
            </animated.div>
          );
        else if (item === ClientViews.LOBBY) {
          return (
            <animated.div style={props}>
              <LobbyView />
            </animated.div>
          );
        }
        return (
          <animated.div style={props}>
            <GamePage />
          </animated.div>
        );
      })}
    </>
  );
}

export default GameClientPage;
