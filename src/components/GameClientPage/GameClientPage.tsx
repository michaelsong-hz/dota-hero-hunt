import React, { useContext } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useParams } from "react-router-dom";

import ConnectedPlayers from "components/ConnectedPlayers";
import HeroGrid from "components/HeroGrid";
import usePeerAsClient from "hooks/usePeerAsClient";
import { ClientTypeConstants } from "models/MessageClientTypes";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { GameStatusContext } from "reducer/GameStatusContext";
import { GameStatusReducer } from "reducer/gameStatus";

interface GameClientPageParams {
  remoteHostID: string;
}

function GameClientPage(): JSX.Element {
  const { remoteHostID } = useParams<GameClientPageParams>();
  const { state, dispatch } = useContext(GameStatusContext);

  const playerName = localStorage.getItem("playerName") || "";

  const [sendToHost] = usePeerAsClient({
    playerName,
    remoteHostID,
    onMessageFromHost,
  });

  function onMessageFromHost(data: HostTypes) {
    console.log("received message", data);
    console.log("state in function", state);

    switch (data.type) {
      case HostTypeConstants.CONNECTION_ACCEPTED: {
        console.log("Connection accepted by host");
        dispatch({
          type: GameStatusReducer.UPDATE_HOST_CONNECTION_STATE,
          isConnectedToHost: true,
        });
        break;
      }
      case HostTypeConstants.UPDATE_GAME_STATE: {
        dispatch({
          type: GameStatusReducer.UPDATE_PLAYERS_LIST,
          currentPlayers: data.connectedPlayers,
        });
        break;
      }
      case HostTypeConstants.UPDATE_ROUND: {
        console.log("incrementing round");
        dispatch({
          type: GameStatusReducer.INCREMENT_ROUND,
          targetHeroes: new Set(data.targetHeroes),
          currentHeroes: data.currentHeroes,
        });
        break;
      }
      case HostTypeConstants.UPDATE_FROM_CLICK: {
        dispatch({
          type: GameStatusReducer.UPDATE_SELECTED_ICONS,
          selectedIcons: new Set(data.selected),
        });
        dispatch({
          type: GameStatusReducer.UPDATE_PLAYERS_LIST,
          currentPlayers: data.players,
        });
        console.log("updated selected icons", data.selected);
        break;
      }
      default: {
        console.log("Invalid message received", data);
      }
    }
  }

  function handleClick(heroNumber: number) {
    console.log("clicked", heroNumber);
    sendToHost({
      type: ClientTypeConstants.PLAYER_ACTION,
      playerName: playerName,
      selected: heroNumber,
    });
  }

  function getPageContent(): JSX.Element | JSX.Element[] {
    if (state.round === 0) {
      return (
        <Col>
          <h3>Waiting for the game to start</h3>
        </Col>
      );
    }

    return <HeroGrid handleClick={handleClick} />;
  }

  // If waiting to receive data from host
  if (state.players.length === 0) {
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

export default GameClientPage;
