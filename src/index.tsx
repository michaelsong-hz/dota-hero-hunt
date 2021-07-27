import { init } from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { store } from "store/rootStore";

import "@fontsource/roboto";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import "./styles/index.scss";

import App from "./App";

function getSentryEnv() {
  if (process.env.REACT_APP_BUILD_ENV !== undefined) {
    return process.env.REACT_APP_BUILD_ENV;
  }
  return "development";
}

// Sentry error logging in production
if (process.env.NODE_ENV === "production") {
  init({
    dsn: "https://a2a3f71a08d2493a9577082e08d93939@o468033.ingest.sentry.io/5495363",
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    normalizeDepth: 8, // For sentry redux
    release: process.env.REACT_APP_VERSION,
    environment: getSentryEnv(),
    ignoreErrors: [
      // Ignore errors thrown by Safari 🤡 when the share action is cancelled
      // https://dev.to/grafton-studio/native-tap-to-share-in-javascript-with-the-web-share-api-current-status-tips-and-limitations-4g4h
      "AbortError: Abort due to cancellation of share.",
    ],
  });
  // eslint-disable-next-line no-console
  console.log(
    `Sentry initialized in environment: "${getSentryEnv()}" with release version: "${
      process.env.REACT_APP_VERSION
    }".`
  );
}

// TODO: Bootstrap 4 currently causes warnings to be thrown in strict mode
// Investigate re-enabling strict mode after Bootstrap 5 is released
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
