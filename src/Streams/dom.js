import * as most from "most";

function getDataTarget(event) {
  let element = event.target;
  while (element) {
    if (Object.keys(element.dataset).length > 0) {
      return element.dataset;
    }
    element = element.parentElement;
  }
}

export function DocumentReady$() {
  return most.fromEvent("DOMContentLoaded", document);
}

export function ClickWithDataTarget$() {
  return most.fromEvent("click", document)
    .map(getDataTarget)
    .filter((target) => target)
    .tap(() => console.log("click"))
    .multicast();
}
