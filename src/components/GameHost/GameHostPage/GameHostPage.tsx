import React, { useEffect, useState, useRef, useCallback } from "react";
import { Container } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import HeroGrid from "components/GameShared/HeroGrid";
import LobbyView from "components/GameShared/LobbyView";
import useHostPeer from "hooks/useHostPeer";
import useResetOnLeave from "hooks/useResetOnLeave";
import useSoundEffect from "hooks/useSoundEffect";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import {
  ClientDataConnection,
  HostTypeConstants,
} from "models/MessageHostTypes";
import { useStoreState, useStoreDispatch } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { heroList } from "utils/HeroList";
import { SoundEffects } from "utils/SoundEffectList";
import { appendTheme } from "utils/utilities";

function GameHostPage(): JSX.Element {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const [preparingNextRound, setPreparingNextRound] = useState(false);
  const [playerName, setPlayerName] = useState("");

  // Keeping state in ref as we can't access the store in peer js callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [hostID, startHosting, sendToClients, cleanUpConnections] = useHostPeer(
    {
      playerName,
      stateRef,
      onMessage,
    }
  );
  const [playAudio] = useSoundEffect();
  useResetOnLeave({ cleanUpConnections });

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
  function onMessage(data: ClientTypes, incomingConn: ClientDataConnection) {
    const fromPlayerName = incomingConn.metadata.playerName as string;

    if (data.type === ClientTypeConstants.PLAYER_ACTION) {
      // TODO: Error handling, checking received data
      addSelectedIcon(data.selected, fromPlayerName);
    } else if (data.type === ClientTypeConstants.NEW_CONNECTION) {
      const currentPlayers = { ...stateRef.current.players };
      currentPlayers[fromPlayerName] = {
        score: 0,
        isDisabled: false,
      };

      incomingConn.send({
        type: HostTypeConstants.CONNECTION_ACCEPTED,
        settings: stateRef.current.gameSettings,
        players: stateRef.current.players,
        round: stateRef.current.round,
        targetHeroes: Array.from(stateRef.current.targetHeroes),
        currentHeroes: stateRef.current.currentHeroes,
        selected: Array.from(stateRef.current.selectedIcons),
        invalidIcons: Array.from(stateRef.current.invalidIcons),
      });
      sendToClients({
        type: HostTypeConstants.UPDATE_PLAYERS_LIST,
        players: currentPlayers,
      });
      dispatch({
        type: StoreConstants.UPDATE_PLAYERS_LIST,
        currentPlayers,
      });
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

  // Game lobby
  if (state.round === 0) {
    return (
      <LobbyView
        playerName={playerName}
        inviteLink={getInviteLink()}
        isSingleP={hostID ? false : true}
        setPlayerName={setPlayerName}
        startGame={() => incrementRound(1)}
        startHosting={() => startHosting()}
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
          <HeroGrid
            handleClick={(heroNumber: number) =>
              addSelectedIcon(heroNumber, playerName)
            }
          />
        </Col>
      </Row>
    </Container>
  );
}

export default GameHostPage;
