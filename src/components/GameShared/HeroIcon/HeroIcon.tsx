import React, { useEffect, useState } from "react";

interface IHeroIconProps {
  key: string;
  src: string;
  onClick: () => void;
  heroNumber: number;
  selectedIcons: Set<number>;
}

function HeroIcon(props: IHeroIconProps): JSX.Element {
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (props.selectedIcons.has(props.heroNumber)) {
      setIsHighlighted(true);
    } else if (isHighlighted) {
      setIsHighlighted(false);
    }
  }, [isHighlighted, props.heroNumber, props.selectedIcons]);

  return (
    <img
      className={
        isHighlighted ? "hero-icon hero-icon-highlighted" : "hero-icon"
      }
      src={props.src}
      onClick={() => {
        props.onClick();
      }}
      alt="hero icon"
    ></img>
  );
}

export default HeroIcon;
