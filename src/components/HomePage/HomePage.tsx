import React, { useState } from "react";
import { Jumbotron } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { Redirect } from "react-router-dom";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

function HomePage(): JSX.Element {
  const state = useStoreState();

  const [toHostGame, setToHostGame] = useState(false);

  function getJumbotronClassName(): string {
    let returnString = "d-flex flex-column align-items-center";
    if (state.appSettings.isDark) {
      returnString += " bg-dark";
    }
    return returnString;
  }

  if (toHostGame) {
    return <Redirect to="/play" />;
  }

  return (
    <div className="homepage-container">
      <Jumbotron className={`${getJumbotronClassName()}`}>
        <div className="text-center p-2">
          <h1>Dota Hero Hunt</h1>
        </div>
        <div className="mt-3">
          <Button
            className="homepage-button"
            variant={appendTheme("primary", state.appSettings.isDark)}
            size="lg"
            onClick={() => setToHostGame(true)}
          >
            Play!
          </Button>
        </div>
      </Jumbotron>
    </div>
  );
}

export default HomePage;
