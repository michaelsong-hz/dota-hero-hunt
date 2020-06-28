import { isUndefined, isNullOrUndefined } from "util";

import Peer from "peerjs";
import React, {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useReducer,
  useRef,
} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

import gameSettingsReducer, {
  gameSettingsInitialState,
} from "reducers/GameSettingsReducer";
import gameStatusReducer, {
  gameStatusInitialState,
  GameStatusReducer,
} from "reducers/GameStatusReducer";
import ConnectionsHandler from "utils/ConnectionsHandler";
import { heroList } from "utils/HeroList";

import HeroIcon from "../HeroIcon";

interface IGamePageProps {
  remoteHostID?: string;
}

function GamePage(props: IGamePageProps): JSX.Element {
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const [hostID, setHostID] = useState<string>();
  const [remoteHostID, setRemoteHostID] = useState<string>();

  let playerName = localStorage.getItem("playerName") || "";

  const currentHeroes = [
    [32, 63, 34, 118, 43, 38, 17, 91, 96, 5, 93, 79],
    [8, 15, 111, 95, 11, 20, 62, 65, 113, 115, 69, 53],
    [55, 104, 37, 19, 112, 81, 56, 74, 33, 27, 29, 70],
    [82, 114, 50, 107, 13, 16, 39, 90, 57, 100, 40, 4],
    // [117, 18, 68, 41, 103, 109, 73, 71, 25, 52, 86, 30],
    // [6, 77, 110, 7, 46, 72, 61, 9, 99, 119, 21, 45],
    // [47, 22, 49, 78, 67, 2, 80, 101, 88, 66, 97, 1],
    // [51, 116, 108, 44, 98, 12, 28, 75, 26, 60, 35, 105],
    // [48, 83, 64, 94, 58, 10, 3, 84, 42, 14, 59, 102],
  ];

  const peer = useRef<Peer>();

  const [gameSettingsState, setGameSettingsState] = useReducer(
    gameSettingsReducer,
    gameSettingsInitialState
  );
  const [gameStatusState, setGameStatusState] = useReducer(
    gameStatusReducer,
    gameStatusInitialState
  );

  const [selectedIcons, setSelectedIcons]: [
    Set<number>,
    Dispatch<SetStateAction<Set<number>>>
  ] = useState(new Set());

  const [connectionsHandler, setConnectionsHandler] = useState<
    ConnectionsHandler
  >();

  useEffect(() => {
    // Connect to a local dev server if in development, and the cloud hosted peer js
    // server if in production. The cloud hosted peer js server rate limits new
    // connections, which is problematic when developing and hot reloading the application.
    if (
      !isNullOrUndefined(process.env.NODE_ENV) &&
      process.env.NODE_ENV === "development"
    ) {
      peer.current = new Peer({
        host: "localhost",
        port: 9000,
        path: "/play",
      });
    } else {
      peer.current = new Peer();
    }

    // Cleans up connections when leaving or reloading the page
    window.addEventListener("beforeunload", cleanup);
    function cleanup() {
      if (peer.current) {
        peer.current.destroy();
      }
    }
    return () => {
      if (peer.current) {
        peer.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isUndefined(connectionsHandler) && peer.current) {
      const currentConnectionsHandler = new ConnectionsHandler(
        peer.current,
        onClientMessage,
        onHostMessage,
        onSetHostID
      );
      setConnectionsHandler(currentConnectionsHandler);
    }

    function onSetHostID(receivedHostID: string) {
      setHostID(receivedHostID);
    }

    function onClientMessage(
      data: any,
      connectedClients: Peer.DataConnection[]
    ) {
      if (data.type === "playeraction") {
        // TODO: Error handling, checking received data
        const currentSelectedIcons = new Set(selectedIcons);
        currentSelectedIcons.add(data.selected);
        setSelectedIcons(currentSelectedIcons);
        console.log("updated selected icons", currentSelectedIcons);

        console.log("broadcasting to clients", connectedClients);
        connectedClients.forEach((clientConnection) => {
          clientConnection.send({
            type: "playeraction",
            name: data.playerName,
            selected: data.selected,
          });
        });
      } else if (data.type === "connection") {
        // TODO: Add entries in reducer to hold player names, scores, currently selected heroes
        // and set their names here, as well as broadcast to other players
        console.log(data);
        setGameStatusState({
          type: GameStatusReducer.REGISTER_NEW_PLAYER,
          newPlayerName: data.playerName,
        });
      }
    }

    function onHostMessage(data: any) {
      console.log(data);
      if (data.type === "connectionaccepted") {
        console.log("Connection accepted by host, downloading game data");
        setGameStatusState({
          type: GameStatusReducer.UPDATE_HOST_CONNECTION_STATE,
          isConnectedToHost: true,
        });
      } else if (data.type === "startgame") {
        console.log("Starting game");
        setGameStatusState({
          type: GameStatusReducer.INCREMENT_ROUND,
        });
      } else if (data.type === "playeraction") {
        // TODO: Error handling, checking received data
        const currentSelectedIcons = new Set(selectedIcons);
        currentSelectedIcons.add(data.selected);
        setSelectedIcons(currentSelectedIcons);
        console.log("updated selected icons", currentSelectedIcons);
      }
    }
  }, [connectionsHandler, peer, selectedIcons]);

  function appendUrl(heroString: string): string {
    return `https://d1wyehvpr5fwo.cloudfront.net/${heroString}`;
  }

  function handleClick(heroNumber: number) {
    console.log("clicked", heroNumber);
    if (connectionsHandler) {
      if (!isUndefined(connectionsHandler.hostConnection)) {
        connectionsHandler.hostConnection.send({
          type: "playeraction",
          playerName: playerName,
          selected: heroNumber,
        });
      } else {
        const currentSelectedIcons = new Set(selectedIcons);
        currentSelectedIcons.add(heroNumber);
        setSelectedIcons(currentSelectedIcons);
        console.log("updated selected icons", currentSelectedIcons);

        connectionsHandler.broadcastToClients({
          type: "playeraction",
          playerName: playerName,
          selected: heroNumber,
        });
      }
    }
  }

  function createHeroImagesRow(rowNumber: number): JSX.Element[] {
    const heroImagesRow: JSX.Element[] = [];

    for (let i = 0; i < currentHeroes[rowNumber].length; i++) {
      const heroNumber = currentHeroes[rowNumber][i];
      heroImagesRow.push(
        <HeroIcon
          key={`heroIcon${i}`}
          src={appendUrl(heroList[heroNumber].url)}
          onClick={() => handleClick(heroNumber)}
          heroNumber={heroNumber}
          selectedIcons={selectedIcons}
        />
      );
    }
    return heroImagesRow;
  }

  function createHeroImages(): JSX.Element[] {
    const heroImages: JSX.Element[] = [];
    for (let i = 0; i < currentHeroes.length; i++) {
      heroImages.push(
        <Row key={`heroIconRow${i}`}>
          <Col>{createHeroImagesRow(i)}</Col>
        </Row>
      );
    }
    return heroImages;
  }

  function handleConnectionModalOpen() {
    setShowConnectionModal(true);
  }

  function handleConnectionModalClose() {
    setShowConnectionModal(false);
  }

  function handleConnectToGame() {
    if (!isUndefined(remoteHostID)) {
      setShowConnectionModal(false);
      if (connectionsHandler) {
        console.log("connecting to", remoteHostID);
        connectionsHandler.connect(remoteHostID, playerName);
      } else {
        console.log("Throw some kind of error");
      }
    } else {
      console.log("Throw some kind of error");
    }
  }

  function startGame(): void {
    if (isNullOrUndefined(playerName)) {
      console.log("invalid playername");
    } else {
      console.log("hi", playerName);
      localStorage.setItem("playerName", playerName);
    }

    connectionsHandler?.broadcastToClients({ type: "startgame" });

    setGameStatusState({
      type: GameStatusReducer.INCREMENT_ROUND,
    });
    console.log("game started", gameStatusState);
  }

  function getPageContent(): JSX.Element | JSX.Element[] {
    if (gameStatusState.round === 0) {
      if (gameStatusState.isConnectedToHost) {
        return (
          <Col>
            <h3>Waiting for the game to start</h3>
          </Col>
        );
      } else {
        return (
          <Col>
            <h3>Your connection ID is: {hostID}</h3>
            <Form>
              <Form.Group>
                <Form.Label>Player Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  defaultValue={playerName}
                  onChange={(e) => (playerName = e.target.value)}
                />
              </Form.Group>
            </Form>
            <Button variant="primary" onClick={() => startGame()}>
              Start Game
            </Button>
            <hr />

            <h3>Already have a connection ID? Join a game here!</h3>
            <Form>
              <Form.Group>
                <Form.Label>Connect to player</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Target player ID"
                  onChange={(e) => setRemoteHostID(e.target.value)}
                />
              </Form.Group>
            </Form>
            <Button
              variant="primary"
              onClick={() => handleConnectionModalOpen()}
            >
              Connect
            </Button>
          </Col>
        );
      }
    }
    return <Col>{createHeroImages()}</Col>;
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

  return (
    <Container>
      <Modal show={showConnectionModal} onHide={handleConnectionModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Connecting to game session {remoteHostID}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Player Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                defaultValue={playerName}
                onChange={(e) => (playerName = e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleConnectionModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConnectToGame}>
            Connect
          </Button>
        </Modal.Footer>
      </Modal>
      <Row>
        <Col>
          <h2>Connected Players</h2>
          {renderConnectedPlayers()}
        </Col>
        {getPageContent()}
      </Row>
    </Container>
  );
}

export default GamePage;
