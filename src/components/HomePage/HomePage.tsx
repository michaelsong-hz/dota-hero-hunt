import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

import { useStoreState } from "reducer/store";
import { appendTheme } from "utils/utilities";

function HomePage(): JSX.Element {
  const state = useStoreState();

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
            <Link
              to="/play"
              className={appendTheme("homepage-play", state.appSettings.isDark)}
              data-toggle="collapse"
            >
              <h1
                className={`d-flex flex-row font-weight-bold ${appendTheme(
                  "homepage-play",
                  state.appSettings.isDark
                )}`}
              >
                Play
                <div className="homepage-play-icon">
                  <FontAwesomeIcon icon={faChevronRight} size="xs" />
                </div>
              </h1>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
