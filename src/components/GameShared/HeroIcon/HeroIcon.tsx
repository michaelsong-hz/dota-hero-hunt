import React, { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { ClientTypeConstants } from "models/MessageClientTypes";
import {
  selectIsDark,
  selectPlayerName,
} from "store/application/applicationSlice";
import { clientPeerSendAction } from "store/client/clientActions";
import {
  selectGameStatus,
  selectInvalidIcons,
  selectSelectedIcons,
  selectTargetHeroes,
} from "store/game/gameSlice";
import { addSelectedIcon } from "store/host/hostThunks";
import { appendTheme, isClient, isDevCheatsEnabled } from "utils/utilities";

interface HeroIconProps {
  src: string;
  heroNumber: number;
}

function HeroIcon(props: HeroIconProps): JSX.Element {
  const { src, heroNumber } = props;

  const isDark = useAppSelector(selectIsDark);
  const playerNameHost = useAppSelector(selectPlayerName);

  const gameStatus = useAppSelector(selectGameStatus);
  const invalidIcons = useAppSelector(selectInvalidIcons);
  const selectedIcons = useAppSelector(selectSelectedIcons);
  const targetHeroes = useAppSelector(selectTargetHeroes);

  const dispatch = useAppDispatch();

  const [isHighlightedValid, setIsHighlightedValid] = useState(false);
  const [isHighlightedInvalid, setIsHighlightedInvalid] = useState(false);

  // Clear the selected icons between rounds
  const prevGameStatus = useRef(gameStatus);
  useEffect(() => {
    if (
      prevGameStatus.current !== GameStatus.PLAYING &&
      gameStatus === GameStatus.PLAYING
    ) {
      setIsHighlightedValid(false);
      setIsHighlightedInvalid(false);
    }
    prevGameStatus.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    if (selectedIcons.has(heroNumber)) {
      setIsHighlightedValid(true);
    } else if (invalidIcons.has(heroNumber)) {
      setIsHighlightedInvalid(true);
    }
  }, [heroNumber, invalidIcons, selectedIcons]);

  function getImageWrapperClassName(): string {
    if (isHighlightedValid) {
      return appendTheme("hero-icon-wrapper hero-icon-wrapper-valid", isDark);
    } else if (isHighlightedInvalid) {
      return appendTheme("hero-icon-wrapper hero-icon-wrapper-invalid", isDark);
    }

    // Make development easier by highlighting icons to find
    if (isDevCheatsEnabled()) {
      if (targetHeroes.find((element) => element === heroNumber)) {
        return "hero-icon-wrapper hero-icon-wrapper-dev";
      }
    }

    return "hero-icon-wrapper";
  }

  function getImageClassName(): string {
    let baseName = "hero-icon";

    if (isHighlightedInvalid) {
      baseName += " hero-icon-invalid";
    }

    if (
      gameStatus === GameStatus.PLAYING_ROUND_END ||
      gameStatus === GameStatus.FINISHED
    ) {
      baseName += " hero-icon-rotate";
    }
    return baseName;
  }

  function handleClick(): void {
    if (isClient()) {
      dispatch(
        clientPeerSendAction({
          type: ClientTypeConstants.PLAYER_ACTION,
          selected: heroNumber,
        })
      );
    } else {
      dispatch(addSelectedIcon(heroNumber, playerNameHost));
    }
  }

  return (
    <div className={getImageWrapperClassName()}>
      <img
        className={getImageClassName()}
        src={src}
        onClick={handleClick}
        alt="hero icon"
        draggable="false"
      ></img>
    </div>
  );
}

export default HeroIcon;
