import { captureException, setContext } from "@sentry/react";
import React, { useEffect, useState, useRef, useCallback } from "react";

import GamePage from "components/GameShared/GamePage";
import LobbyView from "components/GameShared/LobbyView";
import useHostPeer from "hooks/useHostPeer";
import useResetOnLeave from "hooks/useResetOnLeave";
import useSoundEffect from "hooks/useSoundEffect";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import {
  ClientDataConnection,
  HostTypeConstants,
} from "models/MessageHostTypes";
import { OtherErrorTypes } from "models/Modals";
import { PlayerState } from "models/PlayerState";
import { useStoreState, useStoreDispatch } from "reducer/store";
import { StoreConstants } from "reducer/storeReducer";
import { heroList } from "utils/HeroList";
import { SoundEffects } from "utils/SoundEffectList";
import { StorageConstants } from "utils/constants";
import { getPlayerNameFromConn } from "utils/utilities";

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
      stateRef,
      onMessage,
    }
  );
  const [playAudio] = useSoundEffect();
  useResetOnLeave({ cleanUpConnections });

  const reportTargetRoundScoreNotSet = useCallback(() => {
    captureException(
      new Error("Target round score was not set during the game.")
    );
    dispatch({
      type: StoreConstants.SET_MODAL,
      modal: OtherErrorTypes.GENERIC_ERROR,
    });
  }, [dispatch]);

  function addSelectedIcon(
    selectedIcon: number,
    selectedPlayerName: string
  ): void {
    // Retrieve current state from ref
    const currState = stateRef.current;

    if (currState.gameSettings.targetRoundScore === null) {
      reportTargetRoundScoreNotSet();
      return;
    }

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
    const fromPlayerName = getPlayerNameFromConn(incomingConn);

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
    } else {
      try {
        const invalidData = JSON.stringify(data);
        setContext("Invalid Data From Client", {
          fromClient: fromPlayerName,
          invalidData: invalidData,
        });
      } catch (err) {
        setContext("Invalid Data From Client", {
          fromClient: fromPlayerName,
        });
      }
      captureException(new Error("Invalid data received from client"));
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

      if (state.gameSettings.targetRoundScore === null) {
        reportTargetRoundScoreNotSet();
        return;
      }

      let round = state.round + 1;
      if (overrideRound !== undefined) {
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
    [
      dispatch,
      reportTargetRoundScoreNotSet,
      sendToClients,
      state.gameSettings.columns,
      state.gameSettings.rows,
      state.gameSettings.targetRoundScore,
      state.round,
    ]
  );

  // Initializes the game on page load
  useEffect(() => {
    // Retrieve the stored player name
    const storedPlayerName =
      localStorage.getItem(StorageConstants.PLAYER_NAME) || "";

    const currentPlayers: Record<string, PlayerState> = {};
    currentPlayers[storedPlayerName] = {
      score: 0,
      isDisabled: false,
    };

    // Add self to players list
    dispatch({
      type: StoreConstants.UPDATE_PLAYERS_LIST,
      currentPlayers,
    });
    setPlayerName(storedPlayerName);

    // Generates the first game state and starts the game
    incrementRound(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    sendToClients({
      type: HostTypeConstants.UPDATE_SETTINGS,
      settings: state.gameSettings,
    });
  }, [sendToClients, state.gameSettings]);

  function getInviteLink(): string {
    let path = window.location.href;
    path =
      path[path.length - 1] === "/" ? path.substr(0, path.length - 1) : path;
    return `${path}/play/${hostID}`;
  }

  const endGame = useCallback(() => {
    // Reset round to 0 (sends players back to the lobby)
    incrementRound(0);

    // Reset scores to 0
    // Retrieve current state from ref
    const currState = stateRef.current;
    const players = { ...currState.players };

    for (const key in players) {
      const currentPlayer = players[key];
      currentPlayer.score = 0;
      players[key] = currentPlayer;
    }

    sendToClients({
      type: HostTypeConstants.UPDATE_PLAYERS_LIST,
      players,
    });
    dispatch({
      type: StoreConstants.UPDATE_PLAYERS_LIST,
      currentPlayers: players,
    });
  }, [dispatch, incrementRound, sendToClients]);

  // Game lobby
  if (state.round === 0) {
    return (
      <LobbyView
        playerName={playerName}
        inviteLink={getInviteLink()}
        isSingleP={hostID ? false : true}
        setPlayerName={setPlayerName}
        sendToClients={sendToClients}
        startGame={() => incrementRound(1)}
        startHosting={() => startHosting()}
      />
    );
  }

  // Actual game
  return (
    <GamePage
      handleAddSelectedIcon={(heroNumber) =>
        addSelectedIcon(heroNumber, playerName)
      }
      handleEndGame={endGame}
    ></GamePage>
  );
}

export default GameHostPage;
