import { init } from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import React from "react";
import ReactDOM from "react-dom";

import "./styles/index.scss";
import App from "./App";
import { unregister } from "./serviceWorker";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";

// Sentry error logging in production
if (process.env.NODE_ENV === "production") {
  init({
    dsn:
      "https://a2a3f71a08d2493a9577082e08d93939@o468033.ingest.sentry.io/5495363",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    release: process.env.REACT_APP_VERSION,
  });
  // eslint-disable-next-line no-console
  console.log(
    `Production build detected. Sentry initialized with release version: ${process.env.REACT_APP_VERSION}`
  );
}

// Disable devtools in production
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
  }
}

if (process.env.NODE_ENV === "production") {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
    for (const prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (prop === "renderers") {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = new Map();
      } else {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] =
          typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] === "function"
            ? // eslint-disable-next-line @typescript-eslint/no-empty-function
              () => {}
            : null;
      }
    }
  }
}

// TODO: Bootstrap 4 currently causes warnings to be thrown in strict mode
// Investigate re-enabling strict mode after Bootstrap 5 is released
ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();
