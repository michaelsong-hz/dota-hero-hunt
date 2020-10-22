import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import { PlayerState } from "models/PlayerState";
import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { StorageConstants } from "utils/constants";
import { appendTheme } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import LobbyInvite from "../LobbyInvite";
import GameSettings from "../Settings";

interface LobbyViewProps {
  playerName: string;
  inviteLink: string;
  isSingleP: boolean;
  setPlayerName: (playerName: string) => void;
  startGame?: () => void;
  startHosting?: () => void;
}

function LobbyView(props: LobbyViewProps): JSX.Element {
  const state = useStoreState();
  const dispatch = useStoreDispatch();
  const {
    playerName,
    inviteLink,
    isSingleP,
    setPlayerName,
    startGame,
    startHosting,
  } = props;

  const [showPlayerNameModal, setShowPlayerNameModal] = useState(true);

  // Sets the player name
  const submitPlayerName = useCallback(
    (submittedPlayerName: string) => {
      setShowPlayerNameModal(false);

      const currentPlayers: Record<string, PlayerState> = {};
      currentPlayers[submittedPlayerName] = {
        score: 0,
        isDisabled: false,
      };

      // Add self to players list
      dispatch({
        type: StoreConstants.UPDATE_PLAYERS_LIST,
        currentPlayers,
      });
    },
    [dispatch]
  );

  // Retrieve the saved player name
  useEffect(() => {
    const storedPlayerName =
      localStorage.getItem(StorageConstants.PLAYER_NAME) || "";
    if (storedPlayerName !== "") {
      submitPlayerName(storedPlayerName);
    }
    setPlayerName(storedPlayerName);
  }, [setPlayerName, submitPlayerName]);

  return (
    <Container className="mt-3">
      <PlayerNameModal
        playerName={playerName}
        showPlayerNameModal={showPlayerNameModal}
        setPlayerName={setPlayerName}
        submitPlayerName={submitPlayerName}
      />
      <Row>
        <Col
          sm="12"
          md="auto"
          className={`${appendTheme(
            "content-holder",
            state.appSettings.isDark
          )} mt-3`}
        >
          <ConnectedPlayers />
        </Col>
        <Col className="mt-2">
          <Row>
            <LobbyInvite
              inviteLink={inviteLink}
              isSingleP={isSingleP}
              startHosting={startHosting}
            />
          </Row>
          <Row>
            <GameSettings
              inviteLink={inviteLink}
              disabled={startGame ? false : true}
              startGame={() => {
                if (startGame) startGame();
              }}
              changeName={() => setShowPlayerNameModal(true)}
            />
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default LobbyView;
