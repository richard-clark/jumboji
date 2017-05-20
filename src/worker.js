import * as tree from "./tree.js";
import * as most from "most";
import regeneratorRuntime from "regenerator-runtime";

function* getEmojiForPixelData(emojiData, pixelData, maxVariation=0.9) {
  yield { loading: true };

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

  yield {
    data: emojiPixelData,
    loading: false
  }
}

function rand(exclusiveMax) {
  return Math.floor(Math.random() * exclusiveMax);
}

const message$ = most.fromEvent("message", self);

message$.concatMap(({data}) => {
  const {emojiData, pixelData, maxVariation} = data;
  const s$ = getEmojiForPixelData(emojiData, pixelData, maxVariation);
  return most.from(s$);
})
.observe((event) => self.postMessage(event));
