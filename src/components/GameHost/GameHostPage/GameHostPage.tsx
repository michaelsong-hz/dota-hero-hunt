import React, { useEffect, useState, useRef, useCallback } from "react";
import { Container, Spinner } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import HeroGrid from "components/GameShared/HeroGrid";
import GameSettings from "components/GameShared/Settings";
import useHostPeer from "hooks/useHostPeer";
import useSoundEffect from "hooks/useSoundEffect";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import { HostTypeConstants } from "models/MessageHostTypes";
import { PlayerState } from "models/PlayerState";
import { useStoreState, useStoreDispatch } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { heroList } from "utils/HeroList";
import { SoundEffects } from "utils/SoundEffectList";
import { StorageConstants } from "utils/constants";

function GameHostPage(): JSX.Element {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const [preparingNextRound, setPreparingNextRound] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(true);

  // Keeping state in ref as we can't access the store in peer js callbacks
  const stateRef = useRef(state);

  const [hostID, sendToClients] = useHostPeer({
    state,
    playerName,
    onMessage,
  });
  const [playAudio] = useSoundEffect();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    setPlayerName(localStorage.getItem(StorageConstants.PLAYER_NAME) || "");
  }, []);

  function addSelectedIcon(
    selectedIcon: number,
    selectedPlayerName: string
  ): void {
    // Ignore if we have reached the target for selected icons, or the icon has
    // already been clicked this round, or the player is disabled
    // TODO: Get from game settings
    if (
      stateRef.current.selectedIcons.size >= 3 ||
      stateRef.current.selectedIcons.has(selectedIcon) ||
      stateRef.current.invalidIcons.has(selectedIcon) ||
      stateRef.current.players[selectedPlayerName].isDisabled
    ) {
      return;
    }

    const selectedIcons = new Set(stateRef.current.selectedIcons);
    const invalidIcons = new Set(stateRef.current.invalidIcons);
    const players = { ...stateRef.current.players };
    let isCorrectHero;

    if (!stateRef.current.targetHeroes.has(selectedIcon)) {
      isCorrectHero = false;
      invalidIcons.add(selectedIcon);

      players[selectedPlayerName].score -= 1;
      if (selectedPlayerName === playerName) {
        playAudio(SoundEffects.Headshake);
      }
    } else {
      isCorrectHero = true;
      selectedIcons.add(selectedIcon);

      players[selectedPlayerName].score += 1;
      if (selectedPlayerName === playerName) {
        playAudio(SoundEffects.PartyHorn);
      } else {
        playAudio(SoundEffects.Frog);
      }
    }

    sendToClients({
      type: HostTypeConstants.UPDATE_FROM_CLICK,
      isCorrectHero: isCorrectHero,
      players: players,
      lastClickedPlayerName: selectedPlayerName,
      selected: Array.from(selectedIcons),
      invalidIcons: Array.from(invalidIcons),
    });
    dispatch({
      type: StoreConstants.UPDATE_SELECTED_ICONS,
      selectedIcons,
      currentPlayers: players,
    });
  }

  /**
   * Called when message is received from peer
   * Need to use refs instead of state inside as Peer JS callback does
   * not include our state
   * @param data
   */
  function onMessage(data: ClientTypes) {
    if (data.type === ClientTypeConstants.PLAYER_ACTION) {
      // TODO: Error handling, checking received data
      addSelectedIcon(data.selected, data.playerName);
    } else if (data.type === ClientTypeConstants.NEW_CONNECTION) {
      // If player name hasn't been taken, accept the connection
      if (!(data.playerName in stateRef.current.players)) {
        const currentPlayers = { ...stateRef.current.players };
        currentPlayers[data.playerName] = {
          score: 0,
          isDisabled: false,
        };

        sendToClients({
          type: HostTypeConstants.CONNECTION_ACCEPTED,
          players: currentPlayers,
        });
        dispatch({
          type: StoreConstants.UPDATE_PLAYERS_LIST,
          currentPlayers,
        });
      } else {
        // Let client know that the player name has been taken
        const currPlayerNames: string[] = [];

        for (const currPlayerName of Object.keys(stateRef.current.players)) {
          currPlayerNames.push(currPlayerName);
        }

        sendToClients({
          type: HostTypeConstants.PLAYER_NAME_TAKEN,
          currentPlayers: currPlayerNames,
        });
      }
    }
  }

  const incrementRound = useCallback(
    (overrideRound?: number) => {
      // TODO: Clean up function
      function shuffle(array: number[]) {
        let i = array.length,
          j = 0,
          temp;

        while (i--) {
          j = Math.floor(Math.random() * (i + 1));

          // swap randomly chosen element with current element
          temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }

        return array;
      }

      let round = state.round + 1;
      if (overrideRound) {
        round = overrideRound;
      }

      const allHeroIcons: number[] = [];
      heroList.forEach((hero, i) => {
        allHeroIcons.push(i);
      });
      // TODO: Get game settings current heroes
      const rowTarget = 16;
      // const rowTarget = 6;
      const currentHeroesFlat = shuffle(allHeroIcons).slice(0, 96);
      // const currentHeroesFlat = shuffle(allHeroIcons).slice(0, 24);
      const currentHeroes: number[][] = [];
      let currentRow: number[] = [];
      currentHeroesFlat.forEach((hero, i) => {
        currentRow.push(hero);
        if ((i + 1) % rowTarget === 0) {
          currentHeroes.push(currentRow);
          currentRow = [];
        }
      });

      // TODO: Get game settings target heroes
      const targetHeroes = new Set(shuffle(currentHeroesFlat).slice(0, 3));

      sendToClients({
        type: HostTypeConstants.UPDATE_ROUND,
        round,
        targetHeroes: Array.from(targetHeroes),
        currentHeroes: currentHeroes,
      });
      dispatch({
        type: StoreConstants.UPDATE_ROUND,
        round,
        targetHeroes: new Set(targetHeroes),
        currentHeroes: currentHeroes,
      });
      console.log("round set to", round);
    },
    [dispatch, sendToClients, state.round]
  );

  /**
   * Automatically sends updates to the clients when the
   * game state change
   */
  useEffect(() => {
    let nextRoundTimer: NodeJS.Timeout;

    // TODO: Get target round score from game settings
    if (state.selectedIcons.size === 3 && !preparingNextRound) {
      // Prepare next round
      console.log("set next round timer");
      nextRoundTimer = setTimeout(() => setPreparingNextRound(true), 3000);
    }

    if (preparingNextRound) {
      setPreparingNextRound(false);
      incrementRound();
    }

    return () => {
      console.log("cleared next round timer");
      clearTimeout(nextRoundTimer);
    };
  }, [state.selectedIcons.size, preparingNextRound, incrementRound]);

  // Reset round and player list if leaving the page
  useEffect(() => {
    return () => {
      console.log("left game page, resetting state");
      dispatch({
        type: StoreConstants.UPDATE_ROUND,
        round: 0,
        targetHeroes: new Set(),
        currentHeroes: [],
      });
      dispatch({
        type: StoreConstants.UPDATE_PLAYERS_LIST,
        currentPlayers: {},
      });
    };
  }, [dispatch]);

  function getInviteLink(): string {
    let path = window.location.href;
    path =
      path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
    return `${path}/${hostID}`;
  }

  function getPageContent(): JSX.Element | JSX.Element[] {
    if (state.round === 0) {
      return (
        <GameSettings
          inviteLink={getInviteLink()}
          startGame={() => incrementRound(1)}
        />
      );
    }

    return (
      <HeroGrid
        handleClick={(heroNumber: number) =>
          addSelectedIcon(heroNumber, playerName)
        }
      />
    );
  }

  // If we are waiting to get a host ID from Peer JS
  if (!hostID) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col xs="auto" className="mt-1">
            <Spinner animation="grow" />
          </Col>
          <Col xs="auto">
            <h2>Preparing your game lobby</h2>
          </Col>
        </Row>
      </Container>
    );
  }

  function submitPlayerName() {
    setShowPlayerNameModal(false);

    const currentPlayers: Record<string, PlayerState> = {};
    currentPlayers[playerName] = {
      score: 0,
      isDisabled: false,
    };

    // Add self to players list
    dispatch({
      type: StoreConstants.UPDATE_PLAYERS_LIST,
      currentPlayers,
    });
  }

  return (
    <Container className="mt-4">
      <PlayerNameModal
        playerName={playerName}
        showPlayerNameModal={showPlayerNameModal}
        setPlayerName={setPlayerName}
        submitPlayerName={submitPlayerName}
      />
      <Row>
        <Col xs="auto">
          <ConnectedPlayers />
        </Col>
        <Col>{getPageContent()}</Col>
      </Row>
    </Container>
  );
}

export default GameHostPage;
