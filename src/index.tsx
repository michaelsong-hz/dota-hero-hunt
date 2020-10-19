import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import App from "./App";
import { unregister } from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";

// TODO: Bootstrap 4 currently causes warnings to be thrown in strict mode
// Investigate re-enabling strict mode after Bootstrap 5 is released
ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
unregister();
