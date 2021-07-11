import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { appendTheme } from "utils/utilities";

function SettingsButton(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);

  return (
    <Link to="/settings">
      <Button variant={appendTheme("primary", isDark)}>
        Settings / Invite Friends
      </Button>
    </Link>
  );
}

export default SettingsButton;
