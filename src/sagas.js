import * as effects from "redux-saga/effects";
// import dataUrl from "file-loader!./data.json";
import "whatwg-fetch";
import * as utils from "./utils.js";

// import generateData from "./sagas/generateData.js";

function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

function fetchData() {
  // return fetch(dataUrl).then(response => response.json());
  return import("./data.json");
}

function* getData() {
  // Wait a bit after calling this so that the DOM can be rendered before
  // making the request.
  yield effects.put({ type: "LOAD_DATA_REQUEST" });
  yield effects.call(sleep, 300);
  try {
    const data = yield effects.call(fetchData);
    yield effects.put({ type: "LOAD_DATA_SUCCESS", data: { data } });
  } catch (error) {
    yield effects.put({ type: "LOAD_DATA_ERROR", data: { error } });
  }
}

function* randomizeEmoji() {
  const data = yield effects.select(s => s.data);
  const emoji = data[utils.rand(data.length)].char;
  yield effects.put({ type: "SET_EMOJI", data: { emoji } });
}

function* sagas() {
  yield effects.all([
    effects.takeEvery("DOCUMENT_READY", getData),
    effects.takeEvery("RANDOMIZE_EMOJI", randomizeEmoji),
    // effects.throttle(1000, "*", generateData)
    // effects.fork(generateData)
    // effects.fork(renderImage)
  ]);
}

export default sagas;
