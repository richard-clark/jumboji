import * as effects from "redux-saga/effects";
import * as utils from "../utils.js";
import * as tree from "../tree.js";
import quantize from "quantize";

const SAMPLE_NEIGHBORS = 20;

function getNeighborsWithinVariation(items, maxVariation) {
  let endIndex = 1;
  const maxDistance = items[0].distance * maxVariation;
  while (endIndex < items.length && items[endIndex].distance <= maxDistance) {
    endIndex++;
  }
  return items.slice(0, endIndex);
}

function getEmojiForPixelData(emojiData, pixelData, variationFactor = 10) {
  const pixelDataTree = tree.tree(emojiData, "color");
  const maxVariation = Math.pow(10, 1 + variationFactor / 10) / 10; // 1..10, increasing exponentially

  const emojiPixelData = pixelData.map(data => {
    const allNeighbors = tree.nNearestNeighbors(
      pixelDataTree,
      data.color,
      "color",
      SAMPLE_NEIGHBORS
    );
    const neighbors = getNeighborsWithinVariation(allNeighbors, maxVariation);
    return {
      x: data.x,
      y: data.y,
      item: neighbors[utils.rand(neighbors.length)].node
    };
  });

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

function* generateDataImpl() {
  const { appearanceData, variation, emoji, imageSize } = yield effects.select(
    s => s
  );
  yield effects.put({ type: "WORKER_STARTED" });

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
    imageData = getEmojiForPixelData(emojiData, pixelData, variation);
    palette = getColorPalette(pixelData);
  }

  yield effects.put({ type: "WORKER_COMPLETE", data: { imageData, palette } });
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

function* generateData() {
  let previousState = {};

  while (true) {
    yield effects.take("*");
    const state = yield effects.select(s => ({
      emoji: s.emoji,
      appearanceData: s.appearanceData,
      imageSize: s.imageSize,
      variation: s.variation
    }));
    if (state.appearanceData && !statesAreEqual(previousState, state)) {
      yield effects.call(generateDataImpl);
      previousState = state;
    }
  }
}

export default generateData;
