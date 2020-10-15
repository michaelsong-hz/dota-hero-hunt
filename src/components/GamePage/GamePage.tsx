import React, {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useReducer,
  useMemo,
} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useParams } from "react-router-dom";

import GameStatusBar from "components/GameStatusBar";
import usePeer from "hooks/usePeer";
import { ClientTypeConstants, ClientTypes } from "models/MessageClientTypes";
import { HostTypeConstants, HostTypes } from "models/MessageHostTypes";
import settings, { gameSettingsInitialState } from "reducer/gameSettings";
import status, {
  gameStatusInitialState,
  GameStatusReducer,
} from "reducer/gameStatus";
import { heroList } from "utils/HeroList";

import HeroIcon from "../HeroIcon";

interface GamePageParams {
  remoteHostID: string;
}

function GamePage(): JSX.Element {
  const { remoteHostID } = useParams<GamePageParams>();

  const playerName = localStorage.getItem("playerName") || "";

  const [preparingNextRound, setPreparingNextRound] = useState(false);

  const [gameSettingsState, setGameSettingsState] = useReducer(
    settings,
    gameSettingsInitialState
  );
  const [gameStatusState, setGameStatusState] = useReducer(
    status,
    gameStatusInitialState
  );

  const [hostID, sendToClients, sendToHost] = usePeer({
    playerName,
    remoteHostID,
    onMessageFromHost,
    onMessageFromClient,
  });

  useEffect(() => {
    console.log("remote host id", remoteHostID);
    // If host, add self to players list
    if (remoteHostID === undefined && gameStatusState.players.length === 0) {
      setGameStatusState({
        type: GameStatusReducer.REGISTER_NEW_PLAYER,
        newPlayerName: playerName,
      });
      console.log("Init, currently connected players", playerName);
    }
  }, [gameStatusState.players.length, hostID, playerName]);

  function onMessageFromHost(data: HostTypes) {
    console.log("received message", data);
    console.log("state in function", gameStatusState);

    switch (data.type) {
      case HostTypeConstants.CONNECTION_ACCEPTED: {
        console.log("Connection accepted by host");
        setGameStatusState({
          type: GameStatusReducer.UPDATE_HOST_CONNECTION_STATE,
          isConnectedToHost: true,
        });
        break;
      }
      case HostTypeConstants.UPDATE_GAME_STATE: {
        setGameStatusState({
          type: GameStatusReducer.UPDATE_PLAYERS_LIST,
          currentPlayers: data.connectedPlayers,
        });
        break;
      }
      case HostTypeConstants.UPDATE_ROUND: {
        console.log("incrementing round");
        setGameStatusState({
          type: GameStatusReducer.INCREMENT_ROUND,
          targetHeroes: new Set(data.targetHeroes),
          currentHeroes: data.currentHeroes,
        });
        break;
      }
      case HostTypeConstants.UPDATE_FROM_CLICK: {
        setGameStatusState({
          type: GameStatusReducer.UPDATE_SELECTED_ICONS,
          selectedIcons: new Set(data.selected),
        });
        setGameStatusState({
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

  function onMessageFromClient(data: ClientTypes) {
    if (data.type === ClientTypeConstants.PLAYER_ACTION) {
      // TODO: Error handling, checking received data

      setGameStatusState({
        type: GameStatusReducer.ADD_SELECTED_ICON,
        selectedIcon: data.selected,
        playerName: data.playerName,
      });
      console.log("updated selected icons");
    } else if (data.type === ClientTypeConstants.NEW_CONNECTION) {
      // TODO: Add entries in reducer to hold player names, scores, currently selected heroes
      // and set their names here, as well as broadcast to other players
      console.log(data);
      setGameStatusState({
        type: GameStatusReducer.REGISTER_NEW_PLAYER,
        newPlayerName: data.playerName,
      });
    }
  }

  /**
   * If the player is the host, automatically sends updates to the clients when the
   * round changes
   */
  useEffect(() => {
    if (remoteHostID === undefined) {
      sendToClients({
        type: HostTypeConstants.UPDATE_ROUND,
        targetHeroes: Array.from(gameStatusState.targetHeroes),
        currentHeroes: gameStatusState.currentHeroes,
      });
    }
  }, [gameStatusState.round]);

  /**
   * If the player is the host, automatically sends updates to the clients when the
   * game state change
   */
  // TODO: Possibly move selected icons into game status
  useEffect(() => {
    let nextRoundTimer: NodeJS.Timeout;

    if (remoteHostID === undefined) {
      console.log("sent auto broadcast: icons updated");
      sendToClients({
        type: HostTypeConstants.UPDATE_FROM_CLICK,
        lastClickedPlayerName: "temp",
        selected: Array.from(gameStatusState.selectedIcons),
        players: gameStatusState.players,
      });

      if (
        gameStatusState.selectedIcons.size ===
          gameSettingsState.targetRoundScore &&
        !preparingNextRound
      ) {
        // Prepare next round
        console.log("set next round timer");
        nextRoundTimer = setTimeout(() => setPreparingNextRound(true), 3000);
      }

      if (preparingNextRound) {
        setPreparingNextRound(false);
        const currentRound = gameStatusState.round + 1;
        setGameStatusState({
          type: GameStatusReducer.UPDATE_ROUND,
          round: currentRound,
        });
        console.log("round set to", currentRound);
      }
    }

    return () => {
      console.log("cleared next round timer");
      clearTimeout(nextRoundTimer);
    };
  });

  function appendUrl(heroString: string): string {
    return `https://cdn.dotaherohunt.com/${heroString}`;
  }

  function handleClick(heroNumber: number) {
    console.log("clicked", heroNumber);

    if (remoteHostID !== undefined) {
      sendToHost({
        type: ClientTypeConstants.PLAYER_ACTION,
        playerName: playerName,
        selected: heroNumber,
      });
    } else {
      setGameStatusState({
        type: GameStatusReducer.ADD_SELECTED_ICON,
        selectedIcon: heroNumber,
        playerName: playerName,
      });
    }
  }

  function createHeroImagesRow(rowNumber: number): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];

    for (let i = 0; i < gameStatusState.currentHeroes[rowNumber].length; i++) {
      const heroNumber = gameStatusState.currentHeroes[rowNumber][i];
      heroImagesRow.push(
        <HeroIcon
          key={`heroIcon${i}`}
          src={appendUrl(heroList[heroNumber].url)}
          onClick={() => handleClick(heroNumber)}
          heroNumber={heroNumber}
          selectedIcons={gameStatusState.selectedIcons}
        />
      );
    }
    return heroImagesRow;
  }

  function createHeroImages(): JSX.Element[] {
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < gameStatusState.currentHeroes.length; i++) {
      heroImages.push(
        <Row key={`heroIconRow${i}`}>
          <Col>{createHeroImagesRow(i)}</Col>
        </Row>
      );
    }
    return heroImages;
  }

  function startGame(): void {
    if (playerName === null || playerName === undefined) {
      console.log("invalid playername");
    } else {
      console.log("hi", playerName);
      localStorage.setItem("playerName", playerName);
    }

    setGameStatusState({
      type: GameStatusReducer.UPDATE_ROUND,
      round: 1,
    });
    console.log("game started", gameStatusState);
  }

  function getInviteLink(): string {
    let path = window.location.href;
    path =
      path[path.length - 1] == "/" ? path.substr(0, path.length - 1) : path;
    return `${path}/${hostID}`;
  }

  function getPageContent(): JSX.Element | JSX.Element[] {
    if (gameStatusState.round === 0) {
      if (remoteHostID) {
        return (
          <Col>
            <h3>Waiting for the game to start</h3>
          </Col>
        );
      } else {
        const inviteLink = getInviteLink();
        return (
          <Col>
            <h3>Your connection ID is:</h3>
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
    }

    const heroesToFind: string[] = [];
    gameStatusState.targetHeroes.forEach((targetHero) => {
      heroesToFind.push(heroList[targetHero].name);
    });

    return (
      <Col>
        <Row>
          <Col>
            {gameSettingsState.targetRoundScore ===
            gameStatusState.selectedIcons.size ? (
              <p>Preparing next round</p>
            ) : (
              <p>{heroesToFind}</p>
            )}
          </Col>
        </Row>
        <Row>
          <Col>{createHeroImages()}</Col>
        </Row>
      </Col>
    );
  }

  function renderConnectedPlayers(): JSX.Element[] {
    const connectedPlayers: JSX.Element[] = [];
    gameStatusState.players.forEach((player) => {
      connectedPlayers.push(
        <div key={`player-${player.name}`}>
          <h4>{player.name}</h4>
          <p>{player.score}</p>
          <p>{player.isDisabled}</p>
        </div>
      );
    });
    return connectedPlayers;
  }

  // If hosting and we are waiting to get a host ID from Peer JS
  if (!remoteHostID && !hostID) {
    return (
      <Container>
        <Row>
          <Col>
            <h2>Preparing your game lobby...</h2>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col xs="auto">
          <h2>Connected Players</h2>
          {renderConnectedPlayers()}
        </Col>
        {getPageContent()}
      </Row>
    </Container>
  );
}

export default GamePage;
