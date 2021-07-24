import { faInfinity } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import { useAppSelector } from "hooks/useStore";
import { selectPlayers, selectTargetTotalScore } from "store/game/gameSlice";
import { isSinglePlayer } from "store/host/hostSlice";

function TargetScore(): JSX.Element {
  const targetTotalScore = useAppSelector(selectTargetTotalScore);
  const players = useAppSelector(selectPlayers);
  const isSingleP = useAppSelector(isSinglePlayer);

  let score: JSX.Element;

  if (targetTotalScore === null) {
    score = (
      <FontAwesomeIcon
        className={isSingleP ? "" : "target-score-score-infinity"}
        icon={faInfinity}
      />
    );
  } else {
    score = <>{targetTotalScore}</>;
  }

  let currentScore;
  if (isSingleP) {
    for (const key in players) {
      currentScore = `Score: ${players[key].score} / `;
    }
  } else {
    currentScore = "Score to win: ";
  }

  return (
    <div className="d-flex flex-row align-items-center justify-content-center">
      <h3 className="mb-0">
        {currentScore}
        {score}
      </h3>
    </div>
  );
}

export default TargetScore;
