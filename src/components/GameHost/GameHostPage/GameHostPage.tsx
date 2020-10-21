import React, { useEffect, useState, useRef, useCallback } from "react";
import { Container, Spinner } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import HeroGrid from "components/GameShared/HeroGrid";
import GameSettings from "components/GameShared/Settings";
import useHostPeer from "hooks/useHostPeer";
import useResetOnLeave from "hooks/useResetOnLeave";
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
  useResetOnLeave();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

  // Retrieves player name if it has previously been set
  useEffect(() => {
    const playerName = localStorage.getItem(StorageConstants.PLAYER_NAME) || "";
    if (playerName !== "") {
      submitPlayerName(playerName);
    }
    setPlayerName(playerName);
  }, [submitPlayerName]);

  function addSelectedIcon(
    selectedIcon: number,
    selectedPlayerName: string
  ): void {
    // Retrieve current state from ref
    const currState = stateRef.current;

    // Ignore if we have reached the target for selected icons, or the icon has
    // already been clicked this round, or the player is disabled
    if (
      currState.selectedIcons.size >= currState.gameSettings.targetRoundScore ||
      currState.selectedIcons.has(selectedIcon) ||
      currState.invalidIcons.has(selectedIcon) ||
      currState.players[selectedPlayerName].isDisabled
    ) {
      return;
    }

    const selectedIcons = new Set(currState.selectedIcons);
    const invalidIcons = new Set(currState.invalidIcons);
    const players = { ...currState.players };
    let isCorrectHero;

    if (!currState.targetHeroes.has(selectedIcon)) {
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
      invalidIcons,
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
          settings: stateRef.current.gameSettings,
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
      // Shuffles provided array
      // Could be better optimized to stop after reaching target count
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

      // Build and shuffle new 2d array of hero icons
      const allHeroIcons: number[] = [];
      heroList.forEach((hero, i) => {
        allHeroIcons.push(i);
      });
      const rowTarget = state.gameSettings.columns;
      const totalHeroes = state.gameSettings.columns * state.gameSettings.rows;

      const currentHeroesFlat = shuffle(allHeroIcons).slice(0, totalHeroes);
      const currentHeroes: number[][] = [];
      let currentRow: number[] = [];
      currentHeroesFlat.forEach((hero, i) => {
        currentRow.push(hero);
        if ((i + 1) % rowTarget === 0) {
          currentHeroes.push(currentRow);
          currentRow = [];
        }
      });

      // Build set of heroes to search for next round
      const targetHeroes = new Set(
        shuffle(currentHeroesFlat).slice(0, state.gameSettings.targetRoundScore)
      );

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
    [dispatch, sendToClients, state.gameSettings, state.round]
  );

  /**
   * Automatically sends updates to the clients when the
   * game state change
   */
  useEffect(() => {
    let nextRoundTimer: NodeJS.Timeout;

    if (
      state.selectedIcons.size === state.gameSettings.targetRoundScore &&
      !preparingNextRound
    ) {
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
  }, [
    state.selectedIcons.size,
    preparingNextRound,
    incrementRound,
    state.gameSettings.targetRoundScore,
  ]);

  /**
   * Automatically sends updates to the clients when the game settings change
   */
  useEffect(() => {
    console.log("game settings change");
    sendToClients({
      type: HostTypeConstants.UPDATE_SETTINGS,
      settings: state.gameSettings,
    });
  }, [sendToClients, state.gameSettings]);

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
          disabled={false}
          startGame={() => incrementRound(1)}
          changeName={() => setShowPlayerNameModal(true)}
        />
      );
    }

    return (
      <Col>
        <HeroGrid
          handleClick={(heroNumber: number) =>
            addSelectedIcon(heroNumber, playerName)
          }
        />
      </Col>
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
        {getPageContent()}
      </Row>
    </Container>
  );
}

export default GameHostPage;
