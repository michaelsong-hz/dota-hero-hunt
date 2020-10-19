import React, { useEffect, useState, useContext, useRef } from "react";
import { Spinner } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import PlayerNameModal from "components/GameHost/PlayerNameModal";
import ConnectedPlayers from "components/GameShared/ConnectedPlayers";
import HeroGrid from "components/GameShared/HeroGrid";
import GameSettings from "components/GameShared/Settings";
import useHostPeer from "hooks/useHostPeer";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import { HostTypeConstants } from "models/MessageHostTypes";
import { PlayerState } from "models/PlayerState";
import { GameStatusContext } from "reducer/GameStatusContext";
import { GameStatusReducer } from "reducer/gameStatus";
import { heroList } from "utils/HeroList";

function GameHostPage(): JSX.Element {
  const { state, dispatch } = useContext(GameStatusContext);
  const [preparingNextRound, setPreparingNextRound] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(true);

  // Keeping state in ref as we can't access the store in peer js callbacks
  const stateRef = useRef(state);

  const [hostID, sendToClients] = useHostPeer({
    GameStatusContext,
    playerName,
    onMessage,
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    setPlayerName(localStorage.getItem("playerName") || "");
  }, []);

  function addSelectedIcon(selectedIcon: number, playerName: string): void {
    // Ignore if we have reached the target for selected icons, or the icon has
    // already been clicked this round
    // TODO: Get from game settings
    if (
      stateRef.current.selectedIcons.size >= 3 ||
      stateRef.current.selectedIcons.has(selectedIcon)
    ) {
      return;
    }
    if (!stateRef.current.targetHeroes.has(selectedIcon)) {
      // Do something to punish the player
      console.log("TODO: Punish the player");
      return;
    }

    const selectedIcons = new Set(stateRef.current.selectedIcons);
    selectedIcons.add(selectedIcon);

    const players = [...stateRef.current.players];
    players.forEach((player) => {
      if (player.name === playerName) {
        player.score += 1;
      }
    });

    sendToClients({
      type: HostTypeConstants.UPDATE_FROM_CLICK,
      lastClickedPlayerName: playerName,
      selected: Array.from(selectedIcons),
      players: players,
    });

    dispatch({
      type: GameStatusReducer.UPDATE_SELECTED_ICONS,
      selectedIcons,
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
      // Check if the playername has been taken, let client know if
      // it has been taken
      let playerNameTaken = false;
      const currPlayerNames: string[] = [];

      stateRef.current.players.forEach((player) => {
        currPlayerNames.push(player.name);
        if (player.name === data.playerName) {
          playerNameTaken = true;
        }
      });

      // If playername hasn't been taken, accept the connection
      if (!playerNameTaken) {
        const newPlayer: PlayerState = {
          name: data.playerName,
          score: 0,
          isDisabled: false,
        };
        const players = [...stateRef.current.players, newPlayer];

        sendToClients({
          type: HostTypeConstants.CONNECTION_ACCEPTED,
          players,
        });
        dispatch({
          type: GameStatusReducer.UPDATE_PLAYERS_LIST,
          currentPlayers: players,
        });
      } else {
        sendToClients({
          type: HostTypeConstants.PLAYER_NAME_TAKEN,
          currentPlayers: currPlayerNames,
        });
      }
    }
  }

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

  function incrementRound(overrideRound?: number) {
    let round = state.round + 1;
    if (overrideRound) {
      round = overrideRound;
    }

    const allHeroIcons: number[] = [];
    heroList.forEach((hero, i) => {
      allHeroIcons.push(i);
    });
    // TODO: Get game settings current heroes
    // const rowTarget = 16;
    const rowTarget = 6;
    // const currentHeroesFlat = shuffle(allHeroIcons).slice(0, 96);
    const currentHeroesFlat = shuffle(allHeroIcons).slice(0, 24);
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
      type: GameStatusReducer.UPDATE_ROUND,
      round,
      targetHeroes: new Set(targetHeroes),
      currentHeroes: currentHeroes,
    });
    console.log("round set to", round);
  }

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
  });

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
      type: GameStatusReducer.UPDATE_PLAYERS_LIST,
      currentPlayers: [
        {
          name: playerName,
          score: 0,
          isDisabled: false,
        },
      ],
    });
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
