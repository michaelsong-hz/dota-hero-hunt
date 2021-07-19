import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { GameStatus } from "models/GameStatus";
import { ClientTypeConstants } from "models/MessageClientTypes";
import {
  selectIsDark,
  selectPlayerName,
} from "store/application/applicationSlice";
import { clientPeerSendAction } from "store/client/clientActions";
import { selectGameStatus } from "store/game/gameSlice";
import { addSelectedIcon } from "store/host/hostThunks";
import { appendTheme, isClient } from "utils/utilities";

interface HeroIconProps {
  src: string;
  heroNumber: number;
  invalidIcons: Set<number>;
  selectedIcons: Set<number>;
}

function HeroIcon(props: HeroIconProps): JSX.Element {
  const { src, heroNumber, invalidIcons, selectedIcons } = props;

  const isDark = useAppSelector(selectIsDark);
  const gameStatus = useAppSelector(selectGameStatus);
  const playerNameHost = useAppSelector(selectPlayerName);

  const dispatch = useAppDispatch();

  const [isHighlightedValid, setIsHighlightedValid] = useState(false);
  const [isHighlightedInvalid, setIsHighlightedInvalid] = useState(false);

  useEffect(() => {
    if (selectedIcons.has(heroNumber)) {
      setIsHighlightedValid(true);
    } else if (invalidIcons.has(heroNumber)) {
      setIsHighlightedInvalid(true);
    } else if (isHighlightedValid) {
      setIsHighlightedValid(false);
    } else if (isHighlightedInvalid) {
      setIsHighlightedInvalid(false);
    }
  }, [
    invalidIcons,
    selectedIcons,
    isHighlightedValid,
    isHighlightedInvalid,
    heroNumber,
  ]);

  function getImageWrapperClassName(): string {
    if (isHighlightedValid) {
      return appendTheme("hero-icon-wrapper hero-icon-wrapper-valid", isDark);
    } else if (isHighlightedInvalid) {
      return appendTheme("hero-icon-wrapper hero-icon-wrapper-invalid", isDark);
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
