import { captureException, setContext } from "@sentry/react";
import React, { useEffect, useState } from "react";
import { Container, Row } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useParams } from "react-router-dom";

import ConnectionView from "components/GameClient/ConnectionView";
import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import HeroGrid from "components/GameShared/HeroGrid";
import LobbyView from "components/GameShared/LobbyView";
import useClientPeer from "hooks/useClientPeer";
import useResetOnLeave from "hooks/useResetOnLeave";
import useSoundEffect from "hooks/useSoundEffect";
import { ClientTypeConstants } from "models/MessageClientTypes";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import { useStoreDispatch, useStoreState } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { SoundEffects } from "utils/SoundEffectList";
import { StorageConstants } from "utils/constants";
import { appendTheme } from "utils/utilities";

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

  const [connectToHost, sendToHost, cleanUpConnections] = useClientPeer({
    playerName,
    remoteHostID,
    onMessageFromHost,
  });
  const [playAudio] = useSoundEffect();
  useResetOnLeave({ cleanUpConnections });

  useEffect(() => {
    setPlayerName(localStorage.getItem(StorageConstants.PLAYER_NAME) || "");
  }, []);

  function onMessageFromHost(data: HostTypes) {
    switch (data.type) {
      case HostTypeConstants.CONNECTION_ACCEPTED: {
        setIsconnectedToHost(true);

        dispatch({
          type: StoreConstants.SET_SETTINGS,
          gameSettings: data.settings,
        });
        dispatch({
          type: StoreConstants.UPDATE_ROUND,
          round: data.round,
          targetHeroes: new Set(data.targetHeroes),
          currentHeroes: data.currentHeroes,
        });
        dispatch({
          type: StoreConstants.UPDATE_SELECTED_ICONS,
          selectedIcons: new Set(data.selected),
          invalidIcons: new Set(data.invalidIcons),
          currentPlayers: data.players,
        });
        break;
      }
      case HostTypeConstants.UPDATE_PLAYERS_LIST: {
        dispatch({
          type: StoreConstants.UPDATE_PLAYERS_LIST,
          currentPlayers: data.players,
        });
        break;
      }
      case HostTypeConstants.PLAYER_NAME_TAKEN: {
        setIsNameTaken(true);
        cleanUpConnections();
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
        try {
          const invalidData = JSON.stringify(data);
          setContext("Invalid Data From Host", {
            fromHost: invalidData,
          });
        } catch (err) {
          captureException(err);
        }
        captureException(new Error("Invalid data received from host"));
      }
    }
  }

  function handleClick(heroNumber: number) {
    sendToHost({
      type: ClientTypeConstants.PLAYER_ACTION,
      selected: heroNumber,
    });
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
          connectToHost={connectToHost}
          setPlayerName={setPlayerName}
          setIsNameTaken={setIsNameTaken}
        />
      </Container>
    );
  }

  // Game lobby
  if (state.round === 0) {
    return (
      <LobbyView
        playerName={playerName}
        inviteLink={window.location.href}
        setPlayerName={setPlayerName}
        isSingleP={false}
      />
    );
  }

  // Actual game
  return (
    <Container className="mt-3">
      <Row>
        <Col
          className={`${appendTheme(
            "content-holder",
            state.appSettings.isDark
          )} mt-3 mx-3`}
        >
          <ConnectedPlayers />
        </Col>
        <Col
          sm="12"
          md="8"
          className={`${appendTheme(
            "content-holder",
            state.appSettings.isDark
          )} mt-3 py-2`}
        >
          <HeroGrid handleClick={handleClick} />
        </Col>
      </Row>
    </Container>
  );
}

export default GameClientPage;
