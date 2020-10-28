import React, { useEffect, useState } from "react";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

interface IHeroIconProps {
  key: string;
  src: string;
  heroNumber: number;
  onClick: () => void;
}

function HeroIcon(props: IHeroIconProps): JSX.Element {
  const state = useStoreState();

  const [isHighlightedValid, setIsHighlightedValid] = useState(false);
  const [isHighlightedInvalid, setIsHighlightedInvalid] = useState(false);

  useEffect(() => {
    if (state.selectedIcons.has(props.heroNumber)) {
      setIsHighlightedValid(true);
    } else if (state.invalidIcons.has(props.heroNumber)) {
      setIsHighlightedInvalid(true);
    } else if (isHighlightedValid) {
      setIsHighlightedValid(false);
    } else if (isHighlightedInvalid) {
      setIsHighlightedInvalid(false);
    }
  }, [
    isHighlightedInvalid,
    isHighlightedValid,
    props.heroNumber,
    state.invalidIcons,
    state.selectedIcons,
  ]);

  function getImageWrapperClassName(): string {
    if (isHighlightedValid) {
      return appendTheme(
        "hero-icon-wrapper hero-icon-wrapper-valid",
        state.appSettings.isDark
      );
    } else if (isHighlightedInvalid) {
      return appendTheme(
        "hero-icon-wrapper hero-icon-wrapper-invalid",
        state.appSettings.isDark
      );
    }
    return "hero-icon-wrapper";
  }

  function getImageClassName(): string {
    let baseName = "hero-icon";

    if (isHighlightedInvalid) {
      baseName += " hero-icon-invalid";
    }

    if (state.gameSettings.targetRoundScore === state.selectedIcons.size) {
      baseName += " hero-icon-rotate";
    }
    return baseName;
  }

  return (
    <div className={getImageWrapperClassName()}>
      <img
        className={getImageClassName()}
        src={props.src}
        onClick={() => {
          props.onClick();
        }}
        alt="hero icon"
        draggable="false"
      ></img>
    </div>
  );
}

export default HeroIcon;
