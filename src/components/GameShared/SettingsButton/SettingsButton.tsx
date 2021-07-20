import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { clientPeerDisconnect } from "store/client/clientThunks";
import { appendTheme, isClient } from "utils/utilities";

function SettingsButton(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);

  const dispatch = useAppDispatch();

  if (isClient()) {
    return (
      <Link to="/">
        <Button
          variant={appendTheme("danger", isDark)}
          onClick={() => dispatch(clientPeerDisconnect())}
        >
          Disconnect
        </Button>
      </Link>
    );
  }

  return (
    <Link to="/settings">
      <Button variant={appendTheme("primary", isDark)}>
        Settings / Invite Friends
      </Button>
    </Link>
  );
}

export default SettingsButton;
