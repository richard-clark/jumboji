import * as most from "most";
import dataUrl from "../data.json";
import Worker from "../worker.js";
import * as utils from "../utils.js";

function generateDataToRender(appearanceData, config) {
  if (!config.emoji) {
    return { appearanceData }
  }

  const pixelData = utils.getPixelDataForChar(
    config.emoji,
    appearanceData.metrics,
    config.imageSize
  );
  return {
    appearanceData,
    pixelData,
    variation: config.variation
  };
}

function eventsAreEqual(a, b) {
  const areEqual = a.appearanceData.metrics === b.appearanceData.metrics
    && a.config.emoji === b.config.emoji
    && a.config.imageSize === b.config.imageSize
    && a.config.variation === b.config.variation;
  return areEqual;
}

export default function WorkerClient$({appearanceData$, config$}) {

  const worker = new Worker();

  const workerData$ = most.combine(
    ((appearanceData, config) => ({appearanceData, config})),
    appearanceData$,
    config$
  ).skipRepeatsWith(eventsAreEqual)
  .map(({appearanceData, config}) => generateDataToRender(appearanceData, config))
  workerData$.observe((event) => worker.postMessage(event));

  return most.fromEvent("message", worker)
    .map((message) => message.data);

}
