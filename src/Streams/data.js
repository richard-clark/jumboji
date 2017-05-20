import * as most from "most";
import dataUrl from "../data.json";

function loadData() {
  return fetch(dataUrl).then((response) => response.json());
}

export default function Data$() {

  return most.fromPromise(loadData());

}
