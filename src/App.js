import React, { Component } from "react";
import "./main.css";
import { Provider } from "react-redux";
import store from "./store.js";
import "./router.js";

import Nav from "./Components/Nav.js";
import Loader from "./Components/Loader.js";
import Img from "./Components/Img.js";

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
