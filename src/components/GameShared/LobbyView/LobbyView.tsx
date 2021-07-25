import { useMediaQuery } from "@react-hook/media-query";
import React, { useEffect, useRef, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTransition, animated } from "react-spring";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import LobbyInvite from "components/GameShared/LobbyInvite";
import GameSettings from "components/GameShared/Settings";
import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { resetApplication } from "store/application/applicationThunks";
import { selectGameSettings } from "store/game/gameSlice";
import { isSinglePlayer } from "store/host/hostSlice";
import { visitLobbyPage } from "store/host/hostThunks";
import { MediaQueries } from "utils/constants";
import { appendTheme, convertRemToPixels, isClient } from "utils/utilities";

function LobbyView(): JSX.Element {
  const isSingleP = useAppSelector(isSinglePlayer);
  const isDark = useAppSelector(selectIsDark);
  const gameSettings = useAppSelector(selectGameSettings);

  const dispatch = useAppDispatch();

  const playersPanelRef = useRef<HTMLDivElement>(null);
  const [showPlayersPanel, setShowPlayersPanel] = useState(
    isSingleP ? false : true
  );
  const [playersPanelAnimation, setPlayersPanelAnimation] = useState(false);

  const isMDPlus = useMediaQuery(MediaQueries.MD);
  const playersTransition = useTransition(showPlayersPanel, {
    from: () => {
      if (isMDPlus)
        return {
          marginLeft: convertRemToPixels(-16) + "px",
          opacity: 0,
        };

      return {
        marginTop: "-100px",
        opacity: 0,
      };
    },
    enter: () => {
      if (isMDPlus)
        return {
          marginLeft: "0px",
          opacity: 1,
        };

      return {
        marginTop: "0px",
        opacity: 1,
      };
    },
    leave: () => {
      if (isMDPlus) {
        let currentWidth = 0;
        if (playersPanelRef.current)
          currentWidth =
            playersPanelRef.current.clientWidth + convertRemToPixels(1);
        return {
          marginLeft: `-${currentWidth}px`,
          opacity: 0,
        };
      }

      let currentHeight = 0;
      if (playersPanelRef.current)
        currentHeight =
          playersPanelRef.current.clientHeight + convertRemToPixels(1);
      return {
        marginTop: `-${currentHeight}px`,
        opacity: 0,
      };
    },
  });

  useEffect(() => {
    if (!isClient()) dispatch(visitLobbyPage(gameSettings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animations for the player panel
  useEffect(() => {
    if (!isClient()) {
      if (isSingleP === false && showPlayersPanel === false) {
        // If we started hosting
        setShowPlayersPanel(true);
        setPlayersPanelAnimation(true);
      } else if (isSingleP === true && showPlayersPanel === true) {
        // If we stopped hosting
        setShowPlayersPanel(false);
        setPlayersPanelAnimation(true);
      }
    }
  }, [isSingleP, showPlayersPanel]);

  return (
    <Container fluid="xl" className="mt-3">
      <PlayerNameModal />

      <div className="d-flex flex-column">
        {isClient() && (
          <Link to="/" className="lobby-view-disconnect">
            <Button
              variant={appendTheme("danger", isDark)}
              className="mb-1"
              onClick={() => dispatch(resetApplication())}
            >
              Disconnect
            </Button>
          </Link>
        )}
        <div className="d-flex lobby-view-panels">
          {playersTransition(
            (styles, item) =>
              item && (
                <animated.div
                  ref={playersPanelRef}
                  className={`${appendTheme("content-holder", isDark)} `}
                  style={playersPanelAnimation ? styles : undefined}
                >
                  <ConnectedPlayers />
                </animated.div>
              )
          )}
          <div className="d-flex flex-column lobby-view-inner-panels">
            <div>
              <LobbyInvite />
            </div>
            <div>
              <GameSettings />
            </div>
          </div>
        </div>{" "}
      </div>
    </Container>
  );
}

export default LobbyView;
