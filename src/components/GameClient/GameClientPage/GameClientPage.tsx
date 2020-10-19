import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useParams } from "react-router-dom";

import ConnectionView from "components/GameClient/ConnectionView";
import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import HeroGrid from "components/GameShared/HeroGrid";
import useClientPeer from "hooks/useClientPeer";
import useSoundEffect from "hooks/useSoundEffect";
import { ClientTypeConstants } from "models/MessageClientTypes";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { SoundEffects } from "utils/SoundEffectList";
import { StorageConstants } from "utils/constants";

interface GameClientPageParams {
  remoteHostID: string;
}

function GameClientPage(): JSX.Element {
  const { remoteHostID } = useParams<GameClientPageParams>();
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const [isConnectedToHost, setIsconnectedToHost] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [isNameTaken, setIsNameTaken] = useState(false);

  const [connectToHost, sendToHost, peerError] = useClientPeer({
    playerName,
    remoteHostID,
    onMessageFromHost,
  });
  const [playAudio] = useSoundEffect();

  useEffect(() => {
    setPlayerName(localStorage.getItem(StorageConstants.PLAYER_NAME) || "");
  }, []);

  function onMessageFromHost(data: HostTypes) {
    switch (data.type) {
      case HostTypeConstants.CONNECTION_ACCEPTED: {
        setIsconnectedToHost(true);
        dispatch({
          type: StoreConstants.UPDATE_PLAYERS_LIST,
          currentPlayers: data.players,
        });
        break;
      }
      case HostTypeConstants.PLAYER_NAME_TAKEN: {
        setIsNameTaken(true);
        break;
      }
      case HostTypeConstants.UPDATE_ROUND: {
        dispatch({
          type: StoreConstants.UPDATE_ROUND,
          round: data.round,
          targetHeroes: new Set(data.targetHeroes),
          currentHeroes: data.currentHeroes,
        });
        break;
      }
      case HostTypeConstants.UPDATE_FROM_CLICK: {
        if (data.lastClickedPlayerName === playerName) {
          if (data.isCorrectHero) {
            playAudio(SoundEffects.PartyHorn);
          } else {
            playAudio(SoundEffects.Headshake);
          }
        }
        dispatch({
          type: StoreConstants.UPDATE_SELECTED_ICONS,
          selectedIcons: new Set(data.selected),
          currentPlayers: data.players,
        });
        break;
      }
      default: {
        console.log("Invalid message received", data);
      }
    }
  }

  function handleClick(heroNumber: number) {
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

  // Show connection page, have player set their name and
  // check that there are no conflicting names and that
  // we are connected to the game before proceeding
  if (!isConnectedToHost) {
    return (
      <Container className="mt-4">
        <ConnectionView
          playerName={playerName}
          isNameTaken={isNameTaken}
          peerError={peerError}
          connectToHost={connectToHost}
          setPlayerName={setPlayerName}
          setIsNameTaken={setIsNameTaken}
        />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col xs="auto">
          <ConnectedPlayers />
        </Col>
        <Col>{getPageContent()}</Col>
      </Row>
    </Container>
  );
}

export default GameClientPage;
