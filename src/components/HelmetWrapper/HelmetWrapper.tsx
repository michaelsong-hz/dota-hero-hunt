import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import { useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";

function HelmetWrapper(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);

  const [animateBgColorChange, setAnimateBgColorChange] = useState(false);

  // Only add background change transition after the page loads
  // Prevents white to dark transition on page load (if dark theme is on)
  useEffect(() => {
    // Needs timeout to prevent race condition before browser renders the page
    const timer = setTimeout(() => {
      setAnimateBgColorChange(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  function getClassName(): string {
    let baseName = "";
    if (isDark) {
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
