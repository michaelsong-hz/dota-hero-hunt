import React, { ReactNode } from "react";

import { useAppSelector } from "hooks/useStore";
import { selectSettingsLoaded } from "store/application/applicationSlice";

interface Props {
  children: ReactNode;
}

// Wait for the player's settings to be retrieved before rendering
const LoadStore: React.FC<Props> = ({ children }) => {
  const settingsLoaded = useAppSelector(selectSettingsLoaded);

  if (settingsLoaded) {
    return children as unknown as JSX.Element;
  }
  return <></>;
};

export default LoadStore;
