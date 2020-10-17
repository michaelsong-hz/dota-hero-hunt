import React, { useEffect, useState, useContext, useRef } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import ConnectedPlayers from "components/ConnectedPlayers";
import HeroGrid from "components/HeroGrid";
import useHostPeer from "hooks/useHostPeer";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import { HostTypeConstants } from "models/MessageHostTypes";
import { GameStatusContext } from "reducer/GameStatusContext";
import { GameStatusReducer } from "reducer/gameStatus";

function GameHostPage(): JSX.Element {
  const { state, dispatch } = useContext(GameStatusContext);
  const [preparingNextRound, setPreparingNextRound] = useState(false);

  // TODO: Keeping a separate copy of connected players in ref as we
  // can't access the store in the callback. Need to find a better fix.
  const connectedPlayers = useRef<Set<string>>(new Set());

  const playerName = localStorage.getItem("playerName") || "";

  const [hostID, sendToClients] = useHostPeer({
    GameStatusContext,
    playerName,
    onMessage,
  });

  useEffect(() => {
    // Add self to players list
    if (state.players.length === 0) {
      dispatch({
        type: GameStatusReducer.REGISTER_NEW_PLAYER,
        newPlayerName: playerName,
      });
      connectedPlayers.current.add(playerName);
    }
  }, [dispatch, playerName, state.players.length]);

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
      const inviteLink = getInviteLink();
      return (
        <Col>
          <h3>Your invite link is:</h3>
          <Row>
            <Col xs="auto">
              <p>{inviteLink}</p>
            </Col>
            <Col>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigator.clipboard.writeText(inviteLink)}
              >
                Copy
              </Button>
            </Col>
          </Row>
          <Form>
            <Form.Group>
              <Form.Label>Player Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                defaultValue={playerName}
                onChange={(e) => console.log("ayylmao")}
              />
            </Form.Group>
          </Form>
          <Button variant="primary" onClick={() => startGame()}>
            Start Game
          </Button>
        </Col>
      );
    }

    return <HeroGrid handleClick={handleClick} />;
  }

  // If we are waiting to get a host ID from Peer JS
  if (!hostID) {
    return (
      <Row>
        <Col>
          <h2>Preparing your game lobby...</h2>
        </Col>
      </Row>
    );
  }

  return (
    <Row>
      <ConnectedPlayers />
      {getPageContent()}
    </Row>
  );
}

export default GameHostPage;
