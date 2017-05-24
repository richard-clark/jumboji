import * as tree from "./tree.js";
import * as most from "most";
import regeneratorRuntime from "regenerator-runtime";
import quantize from "quantize";

/*
Previously, we chose a fixed number of neighbors, determined the distance to the
closest, and then filtered out all but neights with

  distance < closestDistance * (1 + MAX_VARIATION)

(MAX_VARIATION was 0.9)
*/

function getEmojiForPixelData(emojiData, pixelData, sampleNeighbors=10) {
  const pixelDataTree = tree.tree(emojiData, "color");

  const emojiPixelData = pixelData.map((data) => {
    const neighbors = tree.nNearestNeighbors(pixelDataTree, data.color, "color", sampleNeighbors);
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

function* process(appearanceData, pixelData, sampleNeighbors) {

  if (!pixelData) {
    return {
      loading: false
    };
  }

  yield { loading: true };

  const emojiData = Object.values(appearanceData.data).filter((value) => value.supported);
  const data = getEmojiForPixelData(emojiData, pixelData, sampleNeighbors);
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
  const {appearanceData, pixelData, sampleNeighbors} = data;
  const s$ = process(appearanceData, pixelData, sampleNeighbors);
  return most.from(s$);
})
.observe((event) => self.postMessage(event));
