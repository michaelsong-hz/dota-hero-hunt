import { faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMediaQuery } from "@react-hook/media-query";
import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "hooks/useStore";
import { selectIsDark } from "store/application/applicationSlice";
import { resetApplication } from "store/application/applicationThunks";
import { MediaQueries } from "utils/constants";
import { appendTheme, isClient } from "utils/utilities";

function SettingsButton(): JSX.Element {
  const isDark = useAppSelector(selectIsDark);
  const isXSPlus = useMediaQuery(MediaQueries.XS);

  const dispatch = useAppDispatch();

  if (isClient()) {
    return (
      <Link to="/">
        <Button
          variant={appendTheme("danger", isDark)}
          onClick={() => dispatch(resetApplication())}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
          Disconnect
        </Button>
      </Link>
    );
  }

  return (
    <Link to="/settings">
      <Button variant={appendTheme("primary", isDark)}>
        <FontAwesomeIcon icon={faCog} className="mr-1" />
        Settings{isXSPlus && " / Invite Friends"}
      </Button>
    </Link>
  );
}

export default SettingsButton;
