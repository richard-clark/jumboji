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
  // useCapture is necessary so that we can prevent this event from
  // occuring in Streams/dropdown.js
  return most.fromEvent("mouseup", document.body, true)
    .map(getDataTarget)
    .filter((target) => target)
    .multicast();
}
