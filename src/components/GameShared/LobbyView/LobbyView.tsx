import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { PlayerState } from "models/PlayerState";
import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { appendTheme } from "utils/utilities";

import ConnectedPlayers from "../ConnectedPlayers";
import LobbyInvite from "../LobbyInvite";
import GameSettings from "../Settings";

interface LobbyViewProps {
  playerName: string;
  inviteLink: string;
  isSingleP: boolean;
  setPlayerName: (playerName: string) => void;
  sendToClients?: (data: HostTypes) => void;
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

  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);

  // Prompts for the player's name if it isn't set
  useEffect(() => {
    if (playerName === "") {
      setShowPlayerNameModal(true);
    }
  }, [playerName]);

  // Sets the player name
  const submitPlayerName = useCallback(
    (submittedPlayerName: string) => {
      setShowPlayerNameModal(false);

      const currentPlayers: Record<string, PlayerState> = {};

      // Omits old name in the new player list, adds new name
      for (const [storePlayerName, storePlayer] of Object.entries(
        state.players
      )) {
        if (storePlayerName !== playerName) {
          currentPlayers[storePlayerName] = storePlayer;
        } else {
          currentPlayers[submittedPlayerName] = storePlayer;
        }
      }

      // Add self to players list
      if (props.sendToClients) {
        props.sendToClients({
          type: HostTypeConstants.UPDATE_PLAYERS_LIST,
          players: currentPlayers,
        });
      }
      dispatch({
        type: StoreConstants.UPDATE_PLAYERS_LIST,
        currentPlayers,
      });
      setPlayerName(submittedPlayerName);
    },
    [dispatch, playerName, props, setPlayerName, state.players]
  );

  return (
    <Container fluid="xl" className="mt-3">
      <PlayerNameModal
        playerName={playerName}
        showPlayerNameModal={showPlayerNameModal}
        submitPlayerName={submitPlayerName}
        goBack={() => {
          if (startGame) startGame();
        }}
      />
      <div className="d-flex lobby-view-panels">
        <div
          className={`${appendTheme(
            "content-holder",
            state.appSettings.isDark
          )}`}
        >
          <ConnectedPlayers />
        </div>
        <div className="d-flex flex-column lobby-view-inner-panels">
          <div>
            <LobbyInvite
              inviteLink={inviteLink}
              isSingleP={isSingleP}
              startHosting={startHosting}
            />
          </div>
          <div>
            <GameSettings
              inviteLink={inviteLink}
              disabled={startGame ? false : true}
              startGame={() => {
                if (startGame) startGame();
              }}
              changeName={() => setShowPlayerNameModal(true)}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}

export default LobbyView;
