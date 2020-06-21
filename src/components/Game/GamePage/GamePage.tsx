import { isUndefined, isNullOrUndefined } from "util";

import Peer from "peerjs";
import React, {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useReducer,
} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import connectionReducer, {
  ConnectionReducerConstants,
} from "reducers/ConnectionReducer";
import gameSettingsReducer, {
  gameSettingsInitialState,
} from "reducers/GameSettingsReducer";
import gameStatusReducer, {
  gameStatusInitialState,
  GameStatusReducer,
} from "reducers/GameStatusReducer";
import { heroList } from "utils/HeroList";

import HeroIcon from "../HeroIcon";

function GamePage(): JSX.Element {
  const playerName = localStorage.getItem("playerName");

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

  const [peer, setPeer] = useState<Peer>();
  const [hostConnection, setHostConnection] = useState<Peer.DataConnection>();
  const [connectionState, setConnectionState] = useReducer(connectionReducer, {
    clientConnections: [],
  });

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

  useEffect(() => {
    if (isUndefined(peer)) {
      const currentPeer = new Peer();

      currentPeer.on("open", () => {
        console.log("peer open", currentPeer.id);
        if (!isNullOrUndefined(playerName)) {
          const currentHostConnection = currentPeer.connect(playerName);

          currentHostConnection.on("open", () => {
            console.log("sending hello");
            currentHostConnection.send({
              type: "debug",
              message: "hi!",
            });
          });
          currentHostConnection.on("data", (data: any) => {
            console.log(data);
            if (data.type === "playeraction") {
              // TODO: Error handling, checking received data
              const currentSelectedIcons = new Set(selectedIcons);
              currentSelectedIcons.add(data.selected);
              setSelectedIcons(currentSelectedIcons);
              console.log("updated selected icons", currentSelectedIcons);
            }
          });

          currentHostConnection.on("error", (err: any) => {
            console.log("connection error", err);
          });

          setHostConnection(currentHostConnection);
        }
      });

      currentPeer.on("connection", (incomingConn) => {
        incomingConn.on("data", (data) => {
          console.log(data);
          if (data.type === "playeraction") {
            // TODO: Error handling, checking received data
            const currentSelectedIcons = new Set(selectedIcons);
            currentSelectedIcons.add(data.selected);
            setSelectedIcons(currentSelectedIcons);
            console.log("updated selected icons", currentSelectedIcons);

            console.log(
              "broadcasting to clients",
              connectionState.clientConnections
            );
            connectionState.clientConnections.forEach((clientConnection) => {
              clientConnection.send({
                type: "playeraction",
                name: data.playerName,
                selected: data.selected,
              });
            });
          }
        });
        incomingConn.on("open", () => {
          incomingConn.send({
            type: "debug",
            message: "hello",
          });
        });

        setConnectionState({
          type: ConnectionReducerConstants.REGISTER_CLIENT,
          newConnection: incomingConn,
        });
        console.log("client connections", incomingConn, connectionState);
      });

      currentPeer.on("error", (err) => {
        console.log("peer connection error", err);
      });
      setPeer(currentPeer);
    }
  }, [peer, playerName, selectedIcons, connectionState]);

  function appendUrl(heroString: string): string {
    return `https://d1wyehvpr5fwo.cloudfront.net/${heroString}`;
  }

  function handleClick(heroNumber: number) {
    console.log("clicked", heroNumber);
    if (!isUndefined(hostConnection)) {
      hostConnection.send({
        type: "playeraction",
        playerName: playerName,
        selected: heroNumber,
      });
    } else {
      connectionState.clientConnections.forEach((clientConnection) => {
        clientConnection.send({
          type: "playeraction",
          playerName: playerName,
          selected: heroNumber,
        });
      });
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

  function startGame(): void {
    setGameStatusState({
      type: GameStatusReducer.UPDATE_ROUND,
      round: 1,
    });
    console.log("game started", gameStatusState);
  }

  function getPageContent(): JSX.Element | JSX.Element[] {
    if (gameStatusState.round === 0) {
      return (
        <Col>
          <p>TODO: Game settings page</p>
          <Button variant="primary" onClick={() => startGame()}>
            Start Game
          </Button>
        </Col>
      );
    }
    return <Col>{createHeroImages()}</Col>;
  }

  return (
    <Container>
      <Row>
        <Col>
          <h2>Connected Players</h2>
        </Col>
        {getPageContent()}
      </Row>
    </Container>
  );
}

export default GamePage;
