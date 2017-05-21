import * as most from "most";
import * as utils from "../utils.js";

function renderImage(data, {metrics}, {tileSize, imageSize, padding}) {

  if (!data) { console.log("render, no data"); return; }

  let paddingAmount = padding ? tileSize * 0.2 : 0;
  let width = tileSize * imageSize + (imageSize - 1) * paddingAmount
  let height = tileSize * imageSize + (imageSize - 1) * paddingAmount;
  const TILE_SIZE = tileSize;

  const emojiCanvas = utils.createCanvas(width, height);
  const context = emojiCanvas.getContext("2d");
  const fontSize = Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;

  for (let {x, y, item} of data) {
    context.fillText(item.char, x * TILE_SIZE + x * paddingAmount - TILE_SIZE * metrics.xOffset, y * TILE_SIZE + TILE_SIZE + y * paddingAmount - TILE_SIZE * metrics.yOffset);
  }

  const image = emojiCanvas.toDataURL("image/png");
  emojiCanvas.remove();

  return image;

}

function imagesAreEqual(a, b) {
  const areEqual = a.dataToRender.data === b.dataToRender.data &&
    a.apperanceData.metrics === b.apperanceData.metrics &&
    a.config.tileSize === b.config.tileSize &&
    a.config.imageSize === b.config.imageSize &&
    a.config.padding === b.config.padding;
  return areEqual;
}

export default function Image$({dataToRender$, apperanceData$, config$}) {
  // When anything that affects the size changes, we'll attempt to render the
  // existing pixel data using the new configuration, resulting in a flicker of
  // an image that is too small or too large. This watches for changes to the
  // size of the image, and clears it, so we don't render anything.
  const clearImage$ = config$
    .scan((previous, config) => ({
      tileSize: config.tileSize,
      imageSize: config.imageSize,
      padding: config.padding,
      sizeChanged: config.tileSize !== previous.tileSize
        || config.imageSize !== previous.imageSize
        || config.padding !== previous.padding
    }), {})
    .filter(({sizeChanged}) => sizeChanged)
    .map(() => null)
    .tap(() => console.log("clear image 2"));

  const image$ = most.combine(
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

  return most.merge(image$, clearImage$);
}
