import React from "react";

interface HeroIconProps {
  key: string;
  src: string;
  heroNumber: number;
}

function HeroIconWinning(props: HeroIconProps): JSX.Element {
  // -10% to 110% X axis
  const location = Math.floor(Math.random() * 121) - 10;
  // 0.0 to 12.0 seconds
  const delay = Math.floor(Math.random() * 12) + Math.random();
  // 3.0 to 6.0 seconds
  const spinSpeed = Math.floor(Math.random() * 2) + 3 + Math.random();
  // 0.0 to 3.0 seconds
  const flySpeedVariance = Math.random();

  let appendClass = "hero-icon-winning-clock";
  if (Math.floor(Math.random() * 2) === 0) {
    appendClass = "hero-icon-winning-counter-clock";
  }

  return (
    <div
      className={`hero-icon-winning ${appendClass}`}
      style={{
        left: `${location}%`,
        // height / 150 allows for a consistent speed on different device sizes
        animationDuration: `${
          window.innerHeight / 150 - flySpeedVariance
        }s, ${spinSpeed}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <img
        className=""
        src={props.src}
        alt="hero icon winning"
        draggable="false"
      ></img>
    </div>
  );
}

export default HeroIconWinning;
