import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import { useStoreState } from "reducer/store";

function HelmetWrapper(): JSX.Element {
  const state = useStoreState();

  const [animateBgColorChange, setAnimateBgColorChange] = useState(false);

  // Only add background change transition after the page loads
  // Prevents white to dark transition on page load (if dark theme is on)
  useEffect(() => {
    setAnimateBgColorChange(true);
  }, []);

  function getClassName(): string {
    let baseName = "";
    if (state.appSettings.isDark) {
      baseName += "helmet-body-dark";
    } else {
      baseName += "helmet-body-light";
    }

    if (animateBgColorChange) {
      baseName += " helmet-body-change-transition";
    }

    return baseName;
  }

  return (
    <Helmet>
      <body className={getClassName()} />
    </Helmet>
  );
}

export default HelmetWrapper;
