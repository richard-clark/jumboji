import React, { Component } from "react";
import logo from "./logo.svg";
import "./main.css";
import { Provider } from "react-redux";
import store from "./store.js";

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

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h1 className="App-title">Welcome to React</h1>
//         </header>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }
//
// export default App;
