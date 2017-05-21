import * as tree from "./tree.js";
import * as most from "most";
import regeneratorRuntime from "regenerator-runtime";
import quantize from "quantize";

function getEmojiForPixelData(emojiData, pixelData, maxVariation=0.9) {
  const pixelDataTree = tree.tree(emojiData, "color");

  const emojiPixelData = pixelData.map((data) => {
    const neighbors = tree.nNearestNeighbors(pixelDataTree, data.color, "color", 10);
    while (neighbors.length > 1 && neighbors[neighbors.length - 1].distance > neighbors[0].distance * (1 + maxVariation)) {
      neighbors.pop();
    }
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

function* process(appearanceData, pixelData, maxVariation=0.9) {

  yield { loading: true };

  const emojiData = Object.values(appearanceData.data);
  const data = getEmojiForPixelData(emojiData, pixelData, maxVariation);
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
  const {appearanceData, pixelData, maxVariation} = data;
  const s$ = process(appearanceData, pixelData, maxVariation);
  return most.from(s$);
})
.observe((event) => self.postMessage(event));
