import React from "react";
import { Helmet } from "react-helmet";

import { useStoreState } from "reducer/store";

function HelmetWrapper(): JSX.Element {
  const state = useStoreState();

  return (
    <Helmet>
      <body
        className={
          state.appSettings.isDark ? "helmet-body-dark" : "helmet-body-light"
        }
      />
    </Helmet>
  );
}

export default HelmetWrapper;
