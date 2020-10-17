import React, { useEffect, useState, useContext, useRef } from "react";
import { Spinner } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import ConnectedPlayers from "components/ConnectedPlayers";
import GameSettings from "components/GameSettings";
import HeroGrid from "components/HeroGrid";
import PlayerNameModal from "components/PlayerNameModal";
import useHostPeer from "hooks/useHostPeer";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import { HostTypeConstants } from "models/MessageHostTypes";
import { GameStatusContext } from "reducer/GameStatusContext";
import { GameStatusReducer } from "reducer/gameStatus";

function GameHostPage(): JSX.Element {
  const { state, dispatch } = useContext(GameStatusContext);
  const [preparingNextRound, setPreparingNextRound] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(true);

  // TODO: Keeping a separate copy of connected players in ref as we
  // can't access the store in the callback. Need to find a better fix.
  const connectedPlayers = useRef<Set<string>>(new Set());

  const [hostID, sendToClients] = useHostPeer({
    GameStatusContext,
    playerName,
    onMessage,
  });

  useEffect(() => {
    setPlayerName(localStorage.getItem("playerName") || "");
  }, []);

  function onMessage(data: ClientTypes) {
    if (data.type === ClientTypeConstants.PLAYER_ACTION) {
      // TODO: Error handling, checking received data
      dispatch({
        type: GameStatusReducer.ADD_SELECTED_ICON,
        selectedIcon: data.selected,
        playerName: data.playerName,
      });
      console.log("updated selected icons");
    } else if (data.type === ClientTypeConstants.NEW_CONNECTION) {
      if (connectedPlayers.current.has(data.playerName)) {
        sendToClients({
          type: HostTypeConstants.PLAYER_NAME_TAKEN,
          currentPlayers: Array.from(connectedPlayers.current),
        });
      } else {
        connectedPlayers.current.add(data.playerName);
        sendToClients({
          type: HostTypeConstants.CONNECTION_ACCEPTED,
        });
        dispatch({
          type: GameStatusReducer.REGISTER_NEW_PLAYER,
          newPlayerName: data.playerName,
        });
      }
    }
  }

  /**
   * Automatically sends updates to the clients when the
   * round changes
   */
  useEffect(() => {
    console.log("sent round update");
    sendToClients({
      type: HostTypeConstants.UPDATE_ROUND,
      targetHeroes: Array.from(state.targetHeroes),
      currentHeroes: state.currentHeroes,
    });
  }, [state.round]);

  /**
   * Automatically sends updates to the clients when the
   * game state change
   */
  useEffect(() => {
    let nextRoundTimer: NodeJS.Timeout;

    console.log("sent auto broadcast: icons updated");
    sendToClients({
      type: HostTypeConstants.UPDATE_FROM_CLICK,
      lastClickedPlayerName: "temp",
      selected: Array.from(state.selectedIcons),
      players: state.players,
    });

    // TODO: Get target round score from game settings
    if (state.selectedIcons.size === 3 && !preparingNextRound) {
      // Prepare next round
      console.log("set next round timer");
      nextRoundTimer = setTimeout(() => setPreparingNextRound(true), 3000);
    }

    if (preparingNextRound) {
      setPreparingNextRound(false);
      const currentRound = state.round + 1;
      dispatch({
        type: GameStatusReducer.UPDATE_ROUND,
        round: currentRound,
      });
      console.log("round set to", currentRound);
    }

    return () => {
      console.log("cleared next round timer");
      clearTimeout(nextRoundTimer);
    };
  });

  function handleClick(heroNumber: number) {
    console.log("clicked", heroNumber);
    dispatch({
      type: GameStatusReducer.ADD_SELECTED_ICON,
      selectedIcon: heroNumber,
      playerName: playerName,
    });
  }

  function startGame(): void {
    if (playerName === null || playerName === undefined) {
      console.log("invalid playername");
    } else {
      console.log("hi", playerName);
      localStorage.setItem("playerName", playerName);
    }

    dispatch({
      type: GameStatusReducer.UPDATE_ROUND,
      round: 1,
    });
    console.log("game started", state);
  }

  function getInviteLink(): string {
    let path = window.location.href;
    path =
      path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
    return `${path}/${hostID}`;
  }

  function getPageContent(): JSX.Element | JSX.Element[] {
    if (state.round === 0) {
      return (
        <GameSettings inviteLink={getInviteLink()} startGame={startGame} />
      );
    }

    return <HeroGrid handleClick={handleClick} />;
  }

  // If we are waiting to get a host ID from Peer JS
  if (!hostID) {
    return (
      <Row className="justify-content-center">
        <Col xs="auto" className="mt-1">
          <Spinner animation="grow" />
        </Col>
        <Col xs="auto">
          <h2>Preparing your game lobby</h2>
        </Col>
      </Row>
    );
  }

  function submitPlayerName() {
    setShowPlayerNameModal(false);

    // Add self to players list
    dispatch({
      type: GameStatusReducer.REGISTER_NEW_PLAYER,
      newPlayerName: playerName,
    });
    connectedPlayers.current.add(playerName);
  }

  return (
    <>
      <PlayerNameModal
        playerName={playerName}
        showPlayerNameModal={showPlayerNameModal}
        setPlayerName={setPlayerName}
        submitPlayerName={submitPlayerName}
      />
      <Row>
        <ConnectedPlayers />
        {getPageContent()}
      </Row>
    </>
  );
}

export default GameHostPage;
