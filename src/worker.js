import * as tree from "./tree.js";
import * as most from "most";
import regeneratorRuntime from "regenerator-runtime";
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

function getEmojiForPixelData(emojiData, pixelData, variationFactor=10) {
  const pixelDataTree = tree.tree(emojiData, "color");
  const maxVariation = Math.pow(10, 1+variationFactor/10) / 10; // 1..10, increasing exponentially

  const emojiPixelData = pixelData.map((data) => {
    const allNeighbors = tree.nNearestNeighbors(pixelDataTree, data.color, "color", SAMPLE_NEIGHBORS);
    const neighbors = getNeighborsWithinVariation(allNeighbors, maxVariation);
    return {
      x: data.x,
      y: data.y,
      item: neighbors[rand(neighbors.length)].node
    };
  });

  return emojiPixelData;
}

function getColorPalette(data) {
  const opaquePixels = data.filter(({transparent}) => !transparent)
    .map(({rgbColor}) => [rgbColor.r, rgbColor.g, rgbColor.b]);
  const colorMap = quantize(opaquePixels, 4);
  const palette = colorMap.palette();
  const dominantColor = palette[0];


  return colorMap.palette();
}

// Object.values isn't supported on Safari
function objectValues(obj) {
  return Object.keys(obj).map((key) => obj[key]);
}

function* process(appearanceData, pixelData, variation) {
  if (!pixelData) {
    return {
      loading: false
    };
  }

  yield { loading: true };

  const emojiData = objectValues(appearanceData.data).filter((value) => value.supported);
  const data = getEmojiForPixelData(emojiData, pixelData, variation);
  const palette = getColorPalette(pixelData);

  yield {
    loading: false,
    palette,
    data
  };
}

function rand(exclusiveMax) {
  return Math.floor(Math.random() * exclusiveMax);
}

const message$ = most.fromEvent("message", self);

message$.concatMap(({data}) => {
  const {appearanceData, pixelData, variation} = data;
  const s$ = process(appearanceData, pixelData, variation);
  return most.from(s$);
})
.observe((event) => self.postMessage(event));
