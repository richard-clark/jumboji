import dataUrl from "./data.json";
import * as utils from "./utils.js";
import * as tree from "./tree.js";

function loadData() {
  return fetch(dataUrl).then((response) => response.json());
}

function renderEmoji({data}, metrics, size) {
  let width = size;
  let height = size;
  const TILE_SIZE = 48;
  const canvas = utils.createCanvas(TILE_SIZE * width, TILE_SIZE * height);
  const context = canvas.getContext("2d");
  const fontSize = Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;
  context.strokeColor = "red";

  for (let {x, y, item} of data) {
    context.fillText(item.char, x * TILE_SIZE - TILE_SIZE * metrics.xOffset, y * TILE_SIZE + TILE_SIZE - TILE_SIZE * metrics.yOffset);
  }

  // for (let x = 0; x < TILES; x++) {
  //   for (let y = 0; y < TILES; y++) {
  //     const index = y * TILES + x;
  //     const point = data[index];
  //     const char = getChar(point);
  //     context.fillText(char, x * TILE_SIZE - TILE_SIZE * metrics.xOffset, y * TILE_SIZE + TILE_SIZE - TILE_SIZE * metrics.yOffset);
  //     // context.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  //
  //     // 😒
  //
  //   }
  // }


}


function rand(exclusiveMax) {
  return Math.floor(Math.random() * exclusiveMax);
}


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

  return {
    data: emojiPixelData,
    width: pixelData.width,
    height: pixelData.height
  };
}

// TODO: detect emojis that are not present

function render(data) {
  console.log(`loaded ${data.length} data points`);
  // console.log(data[166]);
  // console.log(data[167]);


  const metrics = utils.getTextMetrics();

  const colorData = utils.getColorData(data, metrics);
  console.log("got color data");
  const pixelData = utils.getPixelDataForChar("👓️", metrics, 32);
  console.log("got pixel data");
  const emojiForPixelData = getEmojiForPixelData(colorData, pixelData);
  console.log("got emoji");
  renderEmoji(emojiForPixelData, metrics, 32);
  console.log("rendered");

  // console.log(colorData);




  // doSomething(data, metrics);

}

document.addEventListener("DOMContentLoaded", () => {
  loadData().then(render);
})
