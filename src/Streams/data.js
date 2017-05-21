import * as most from "most";
import dataUrl from "../data.json";

function resolveAfter(time=300) {
  return new Promise((resolve) => window.setTimeout(resolve, time));
}

function loadData(initialDelay) {
  return resolveAfter(initialDelay).then(() => {
    return fetch(dataUrl).then((response) => response.json());
  });
}

// Wait a bit after calling this so that the DOM can be rendered before
// making the request.
export default function Data$({}, initialDelay=300) {

  return most.fromPromise(loadData(initialDelay));

}
