import * as utils from "../utils.js";
import * as effects from "redux-saga/effects";

function render({
  imageData,
  appearanceData,
  tileSize,
  imageSize,
  padding,
  background
}) {
  const { metrics } = appearanceData;

  let paddingAmount = padding ? tileSize * 0.2 : 0;
  let width = tileSize * imageSize + (imageSize - 1) * paddingAmount;
  let height = tileSize * imageSize + (imageSize - 1) * paddingAmount;
  const TILE_SIZE = tileSize;

  const emojiCanvas = utils.createCanvas(width, height);
  document.body.appendChild(emojiCanvas);
  const context = emojiCanvas.getContext("2d");
  const fontSize =
    Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;

  if (background) {
    context.save();
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  for (let { x, y, item } of imageData) {
    context.fillText(
      item.char,
      x * TILE_SIZE + x * paddingAmount - TILE_SIZE * metrics.xOffset,
      y * TILE_SIZE +
        TILE_SIZE +
        y * paddingAmount -
        TILE_SIZE * metrics.yOffset
    );
  }

  const image = emojiCanvas.toDataURL("image/png");
  emojiCanvas.remove();

  return image;
}

function imagesAreEqual(a, b) {
  const areEqual =
    a.imageData === b.imageData &&
    (a.appearanceData ? a.appearanceData.metrics : null) ===
      (b.appearanceData ? b.appearanceData.metrics : null) &&
    a.tileSize === b.tileSize &&
    a.imageSize === b.imageSize &&
    a.padding === b.padding &&
    a.background === b.background &&
    a.variation === b.variation;
  return areEqual;
}

// // When anything that affects the size changes, we'll attempt to render the
// // existing pixel data using the new configuration, resulting in a flicker of
// // an image that is too small or too large. This watches for changes to the
// // size of the image, and clears it, so we don't render anything.
// function* clearAndRender(dataToRender, appearance, config, previousConfig) {
//   if (!dataToRender.data) {
//     yield null;
//   } else {
//     const sizeChanged =
//       previousConfig &&
//       (config.tileSize !== previousConfig.tileSize ||
//         config.imageSize !== previousConfig.imageSize ||
//         config.variation !== previousConfig.variation);
//     if (!sizeChanged) {
//       yield renderImage(dataToRender.data, appearance, config);
//     }
//   }
// }

function imageToBlob(image) {
  if (!image) {
    return;
  }

  // http://stackoverflow.com/a/16245768
  const splitIndex = image.indexOf(",");
  const imageData = atob(image.slice(splitIndex + 1));
  let binaryData = new Array(imageData.length);
  for (let i = 0; i < binaryData.length; i++) {
    binaryData[i] = imageData.charCodeAt(i);
  }
  const byteArray = new Uint8Array(binaryData);
  // http://stackoverflow.com/a/23956661
  const blob = new Blob([byteArray], { type: "image/png" });

  return URL.createObjectURL(blob);
}

export default function* renderImage() {
  let previousState = {};

  while (true) {
    yield effects.take("*");
    const state = yield effects.select(s => ({
      emoji: s.emoji,
      appearanceData: s.appearanceData,
      imageSize: s.imageSize,
      variation: s.variation,
      imageData: s.imageData,
      background: s.background,
      padding: s.padding,
      tileSize: s.tileSize
    }));
    if (
      state.appearanceData &&
      state.imageData &&
      !imagesAreEqual(previousState, state)
    ) {
      const image = render(state);
      const imageUrl = imageToBlob(image);
      yield effects.put({ type: "UPDATE_IMAGE", data: { imageUrl } });
      previousState = state;
    }
  }
}
