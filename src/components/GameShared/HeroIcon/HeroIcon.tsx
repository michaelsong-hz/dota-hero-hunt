import React, { useEffect, useState } from "react";

import { useStoreState } from "reducer/store";

interface IHeroIconProps {
  key: string;
  src: string;
  onClick: () => void;
  heroNumber: number;
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

  function getClassName(): string {
    if (isHighlightedValid) {
      return "hero-icon hero-icon-valid";
    } else if (isHighlightedInvalid) {
      return "hero-icon hero-icon-invalid";
    }
    return "hero-icon";
  }

  return (
    <img
      className={getClassName()}
      src={props.src}
      onClick={() => {
        props.onClick();
      }}
      alt="hero icon"
    ></img>
  );
}

export default HeroIcon;
