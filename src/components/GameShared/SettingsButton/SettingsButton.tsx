import React from "react";
import { Button } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { endGame } from "store/game/gameHostThunks";
import { appendTheme } from "utils/utilities";

function SettingsButton(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);
  const dispatch = useAppDispatch();

  return (
    <Button
      variant={appendTheme("primary", isDark)}
      onClick={() => dispatch(endGame())}
    >
      Settings / Invite Friends
    </Button>
  );
}

export default SettingsButton;
