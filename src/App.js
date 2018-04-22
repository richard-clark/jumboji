import React from "react";
import "./main.css";
import { Provider } from "react-redux";
import store from "./store.js";
import "./router.js";
import "./dataGenerator.js";

import Nav from "./Components/Nav.js";
import Loader from "./Components/Loader.js";
import Img from "./Components/Img.js";

document.addEventListener("DOMContentLoaded", () => {
  window.setTimeout(() => {
    store.dispatch({ type: "DOCUMENT_READY" });
  }, 200);
});

const ESC_KEY = 27;

document.addEventListener("keyup", e => {
  if (e.keyCode === ESC_KEY) {
    e.preventDefault();
    store.dispatch({ type: "CLOSE_DROPDOWN" });
  }
});

export default function App() {
  return (
    <Provider store={store}>
      <div className="main">
        <Nav />
        <Img />
        <Loader />
      </div>
    </Provider>
  );
}
