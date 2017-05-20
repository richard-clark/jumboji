import * as most from "most";
import * as utils from "../utils.js";

function renderImage(data, {metrics}, {tileSize, imageSize}) {

  if (!data) { return; }

  let padding = 5;
  let width = tileSize * imageSize + (imageSize - 1) * padding;
  let height = tileSize * imageSize + (imageSize - 1) * padding;
  const TILE_SIZE = tileSize;

  const emojiCanvas = utils.createCanvas(width, height);
  const context = emojiCanvas.getContext("2d");
  const fontSize = Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;

  for (let {x, y, item} of data) {
    context.fillText(item.char, x * TILE_SIZE + x * padding - TILE_SIZE * metrics.xOffset, y * TILE_SIZE + TILE_SIZE + y * padding - TILE_SIZE * metrics.yOffset);
  }

  const image = emojiCanvas.toDataURL("image/png");
  emojiCanvas.remove();

  return image;

}

function imagesAreEqual(a, b) {
  const areEqual = a.dataToRender.data === b.dataToRender.data &&
    a.apperanceData.metrics === b.apperanceData.metrics &&
    a.config.tileSize === b.config.tileSize &&
    a.config.imageSize === b.config.imageSize;
  return areEqual;
}

export default function Image$({dataToRender$, apperanceData$, config$}) {
  return most.combine(
    ((dataToRender, apperanceData, config) =>
      ({dataToRender, apperanceData, config})),
    dataToRender$,
    apperanceData$,
    config$
  )
  .skipRepeatsWith(imagesAreEqual)
  .map(({dataToRender, apperanceData, config}) =>
    renderImage(dataToRender.data, apperanceData, config)
  );
}
