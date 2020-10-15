import React, { useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { IGameSettingsReducer } from "reducer/gameSettings";
import { IGameStatusReducer } from "reducer/gameStatus";
import { heroList } from "utils/HeroList";

interface IGamePageProps {
  remoteHostID?: string;
}

interface IGameStatusBarProps {
  targetHeroes: Set<number>;
  targetRoundScore: number;
  numSelectedIcons: number;
}

function GameStatusBar(props: IGameStatusBarProps): JSX.Element {
  // const [showConnectionModal, setShowConnectionModal] = useState(false);
  // const [gameID, setGameID] = useState("");
  // const [toHostGame, setToHostGame] = useState(false);
  // const [toJoinGame, setToJoinGame] = useState(false);

  // function handleConnectionModalClose() {
  //   setShowConnectionModal(false);
  // }

  const heroesToFind: string[] = [];
  props.targetHeroes.forEach((targetHero) => {
    heroesToFind.push(heroList[targetHero].name);
  });

  return (
    <Row>
      <Col>
        {props.targetRoundScore === props.numSelectedIcons ? (
          <p>Preparing next round</p>
        ) : (
          <p>{heroesToFind}</p>
        )}
      </Col>
    </Row>
  );
}

export default GameStatusBar;
