import React, { useMemo } from "react";

import { useAppSelector } from "hooks/useStore";
import Placeholder_icon from "images/Placeholder_icon.png";
import { selectIsDark } from "store/application/applicationSlice";
import { appendTheme } from "utils/utilities";

function HeroIconStarting(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);

  const delay = useMemo(
    // 0.0 to 5.0 seconds
    () => Math.floor(Math.random() * 5) + Math.random(),
    []
  );

  return (
    <div className="hero-icon-wrapper">
      <img
        className={appendTheme("hero-icon hero-icon-starting", isDark)}
        style={{
          animationDelay: `-${delay}s`,
        }}
        src={Placeholder_icon}
        alt="hero icon starting"
        draggable="false"
      ></img>
    </div>
  );
}

export default HeroIconStarting;
