import * as most from "most";
import * as utils from "../utils.js";
import regeneratorRuntime from "regenerator-runtime";

function renderImage(data, {metrics}, {tileSize, imageSize, padding, background}) {

  let paddingAmount = padding ? tileSize * 0.2 : 0;
  let width = tileSize * imageSize + (imageSize - 1) * paddingAmount
  let height = tileSize * imageSize + (imageSize - 1) * paddingAmount;
  const TILE_SIZE = tileSize;

  const emojiCanvas = utils.createCanvas(width, height);
  document.body.appendChild(emojiCanvas);
  const context = emojiCanvas.getContext("2d");
  const fontSize = Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;

  if (background) {
    context.save();
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  for (let {x, y, item} of data) {
    context.fillText(item.char, x * TILE_SIZE + x * paddingAmount - TILE_SIZE * metrics.xOffset, y * TILE_SIZE + TILE_SIZE + y * paddingAmount - TILE_SIZE * metrics.yOffset);
  }

  const image = emojiCanvas.toDataURL("image/png");
  emojiCanvas.remove();

  return image;

}

function imagesAreEqual(a, b) {
  const areEqual = a.dataToRender.data === b.dataToRender.data &&
    a.appearanceData.metrics === b.appearanceData.metrics &&
    a.config.tileSize === b.config.tileSize &&
    a.config.imageSize === b.config.imageSize &&
    a.config.padding === b.config.padding &&
    a.config.background === b.config.background &&
    a.config.variation === b.config.variation;
  return areEqual;
}

// When anything that affects the size changes, we'll attempt to render the
// existing pixel data using the new configuration, resulting in a flicker of
// an image that is too small or too large. This watches for changes to the
// size of the image, and clears it, so we don't render anything.
function* clearAndRender(dataToRender, appearance, config, previousConfig) {
  if (!dataToRender.data) {
    yield null;
  } else {
    const sizeChanged = previousConfig
      && (config.tileSize !== previousConfig.tileSize
          || config.imageSize !== previousConfig.imageSize
          || config.variation !== previousConfig.variation);
    if (!sizeChanged) {
      yield renderImage(dataToRender.data, appearance, config);
    }
  }
}

function Image$({dataToRender$, appearanceData$, config$}) {

  const image$ = most.combine(
    ((dataToRender, appearanceData, config) =>
      ({dataToRender, appearanceData, config})),
    dataToRender$,
    appearanceData$,
    config$
  )
  .skipRepeatsWith(imagesAreEqual)
  .scan((previous, {dataToRender, appearanceData, config}) => ({
    dataToRender,
    appearanceData,
    config,
    previousConfig: previous.config
  }), {dataToRender: {}})
  .concatMap(({dataToRender, appearanceData, config, previousConfig}) =>
    most.from(clearAndRender(dataToRender, appearanceData, config, previousConfig))
  );

  return image$;
}

export default function ImageBlob$({dataToRender$, appearanceData$, config$}) {
  const image$ = Image$({dataToRender$, appearanceData$, config$});

  return image$
    .skipRepeats()
    .map((image) => {
      if (image) {
        // http://stackoverflow.com/a/16245768
        const splitIndex = image.indexOf(",");
        const imageData = atob(image.slice(splitIndex+1));
        let binaryData = new Array(imageData.length);
        for (let i = 0; i < binaryData.length; i++) {
          binaryData[i] = imageData.charCodeAt(i);
        }
        const byteArray = new Uint8Array(binaryData);
        // http://stackoverflow.com/a/23956661
        const blob = new Blob([byteArray], {type: "image/png"});
        return blob;
      } else {
        return image;
      }
    })
    .map((imageBlob) => {
      if (imageBlob) {
        // http://stackoverflow.com/a/23956661
        return URL.createObjectURL(imageBlob)
      }
    })
    .multicast();

}
