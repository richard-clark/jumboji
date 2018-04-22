import * as utils from "./utils.js";
import * as tree from "./tree.js";
import quantize from "quantize";
import store from "./store.js";

const SAMPLE_NEIGHBORS = 20;

function getNeighborsWithinVariation(items, maxVariation) {
  let endIndex = 1;
  const maxDistance = items[0].distance * maxVariation;
  while (endIndex < items.length && items[endIndex].distance <= maxDistance) {
    endIndex++;
  }
  return items.slice(0, endIndex);
}

function sleep() {
  return new Promise(resolve => window.requestIdleCallback(resolve));
}

let currentVersion = 1;

async function getEmojiForPixelDataBatched(
  emojiData,
  pixelData,
  variationFactor = 10,
  version
) {
  let index = 0;
  let emojiPixelData = [];
  const pixelDataTree = tree.tree(emojiData, "color");
  const maxVariation = Math.pow(10, 1 + variationFactor / 10) / 10; // 1..10, increasing exponentially

  while (index < pixelData.length) {
    if (version !== currentVersion) {
      return;
    }
    const endIndex = Math.min(index + 1000, pixelData.length);
    store.dispatch({
      type: "WORKER_UPDATED",
      data: {
        workerProgress: index / pixelData.length
      }
    });
    for (let i = index; i < endIndex; i++) {
      const data = pixelData[i];
      const allNeighbors = tree.nNearestNeighbors(
        pixelDataTree,
        data.color,
        "color",
        SAMPLE_NEIGHBORS
      );
      const neighbors = getNeighborsWithinVariation(allNeighbors, maxVariation);
      emojiPixelData.push({
        x: data.x,
        y: data.y,
        item: neighbors[utils.rand(neighbors.length)].node
      });
    }
    index = endIndex;
    await sleep();
  }

  return emojiPixelData;
}

function getColorPalette(data) {
  const opaquePixels = data
    .filter(({ transparent }) => !transparent)
    .map(({ rgbColor }) => [rgbColor.r, rgbColor.g, rgbColor.b]);
  const colorMap = quantize(opaquePixels, 4);

  return colorMap.palette();
}

// Object.values isn't supported on Safari
function objectValues(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

async function generateDataImpl(
  { appearanceData, variation, emoji, imageSize },
  version
) {
  store.dispatch({ type: "WORKER_STARTED" });
  await sleep();
  if (version !== currentVersion) {
    return;
  }

  const pixelData = utils.getPixelDataForChar(
    emoji,
    appearanceData.metrics,
    imageSize
  );

  let palette, imageData;

  if (pixelData) {
    const emojiData = objectValues(appearanceData.data).filter(
      value => value.supported
    );
    imageData = await getEmojiForPixelDataBatched(
      emojiData,
      pixelData,
      variation,
      version
    );
    palette = getColorPalette(pixelData);
  }

  store.dispatch({ type: "WORKER_COMPLETE", data: { imageData, palette } });
}

function statesAreEqual(a, b) {
  const areEqual =
    (a.appearanceData ? a.appearanceData.metrics : null) ===
      (b.appearanceData ? b.appearanceData.metrics : null) &&
    a.emoji === b.emoji &&
    a.imageSize === b.imageSize &&
    a.variation === b.variation;
  return areEqual;
}

let previousState = {};

function throttle(invokee) {
  let timeoutId;
  let lastCalled = 0;
  return function() {
    const now = new Date().getTime();
    window.clearTimeout(timeoutId);
    const delay = Math.max(1000 - (now - lastCalled), 0);
    timeoutId = window.setTimeout(() => {
      lastCalled = new Date().getTime();
      invokee();
    }, delay);
  };
}

const subsDebounced = throttle(() => {
  const state = store.getState();
  if (state.appearanceData && !statesAreEqual(previousState, state)) {
    currentVersion++;
    generateDataImpl(state, currentVersion);
    previousState = state;
  }
});

store.subscribe(() => {
  subsDebounced();
});
