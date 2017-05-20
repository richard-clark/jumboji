import * as most from "most";
import dataUrl from "../data.json";
import Worker from "../worker.js";
import * as utils from "../utils.js";

function generateDataToRender(apperanceData, config) {
  const pixelData = utils.getPixelDataForChar(
    config.emoji,
    apperanceData.metrics,
    config.imageSize
  );
  return {
    apperanceData,
    pixelData,
    maxVariation: config.maxVariation
  };
}

function eventsAreEqual(a, b) {
  const areEqual = a.apperanceData.metrics === b.apperanceData.metrics
    && a.config.emoji === b.config.emoji
    && a.config.imageSize === b.config.imageSize;
  console.log("events are equal", areEqual);
  return areEqual;
}

export default function WorkerClient$({apperanceData$, config$}) {

  const worker = new Worker();

  const workerData$ = most.combine(
    ((apperanceData, config) => ({apperanceData, config})),
    apperanceData$,
    config$
  ).skipRepeatsWith(eventsAreEqual)
  .map(({apperanceData, config}) => generateDataToRender(apperanceData, config))
  workerData$.observe((event) => worker.postMessage(event));

  return most.fromEvent("message", worker)
    .map((message) => message.data);

}
