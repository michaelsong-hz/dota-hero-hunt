import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useParams } from "react-router-dom";

import ConnectionView from "components/GameClient/ConnectionView";
import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import HeroGrid from "components/GameShared/HeroGrid";
import GameSettings from "components/GameShared/Settings";
import useClientPeer from "hooks/useClientPeer";
import useResetOnLeave from "hooks/useResetOnLeave";
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
  useResetOnLeave();

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
        dispatch({
          type: StoreConstants.SET_SETTINGS,
          gameSettings: data.settings,
        });
        break;
      }
      case HostTypeConstants.PLAYER_NAME_TAKEN: {
        setIsNameTaken(true);
        break;
      }
      case HostTypeConstants.UPDATE_SETTINGS: {
        dispatch({
          type: StoreConstants.SET_SETTINGS,
          gameSettings: data.settings,
        });
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
        } else if (data.isCorrectHero) {
          playAudio(SoundEffects.Frog);
        }
        dispatch({
          type: StoreConstants.UPDATE_SELECTED_ICONS,
          invalidIcons: new Set(data.invalidIcons),
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
      return <GameSettings inviteLink={window.location.href} disabled={true} />;
    }

    return (
      <Col>
        <HeroGrid handleClick={handleClick} />
      </Col>
    );
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
        {getPageContent()}
      </Row>
    </Container>
  );
}

export default GameClientPage;
