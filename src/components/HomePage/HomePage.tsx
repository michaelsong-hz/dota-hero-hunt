import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { Redirect } from "react-router-dom";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

function HomePage(): JSX.Element {
  const state = useStoreState();

  const [toHostGame, setToHostGame] = useState(false);

  if (toHostGame) {
    return <Redirect to="/play" />;
  }

  return (
    <>
      <div
        className={`homepage-bg ${appendTheme(
          "homepage-bg",
          state.appSettings.isDark
        )}`}
      />
      <div className="homepage-container">
        <div className="d-flex flex-column align-items-center">
          <div className="text-center p-2">
            <h1 className="display-1 font-weight-bold">Dota Hero Hunt</h1>
          </div>
          <div className="mt-3">
            <Button
              className="homepage-button"
              variant={appendTheme("primary", state.appSettings.isDark)}
              size="lg"
              onClick={() => setToHostGame(true)}
            >
              Play
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
