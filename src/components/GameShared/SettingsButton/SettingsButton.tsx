import React from "react";
import { Button } from "react-bootstrap";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

interface SettingsButtonProps {
  handleClick: () => void;
}

function SettingsButton(props: SettingsButtonProps): JSX.Element {
  const state = useStoreState();

  return (
    <Button
      variant={appendTheme("primary", state.appSettings.isDark)}
      onClick={() => props.handleClick()}
    >
      Settings / Invite Friends
    </Button>
  );
}

export default SettingsButton;
