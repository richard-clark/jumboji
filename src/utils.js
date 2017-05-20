import convert from "color-convert";

export function getOpaqueBoundingBox(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height).data;
  const bounds = Array(width * height).fill(0).map((_, index) => {
    return {
      x: index % width,
      y: Math.floor(index / width),
      opaque: imageData[index * 4 + 3] > 0
    }
  })
  .filter(({opaque}) => opaque)
  .reduce((bounds, {x, y}) => ({
    minX: Math.min(bounds.minX, x),
    maxX: Math.max(bounds.maxX, x),
    minY: Math.min(bounds.minY, y),
    maxY: Math.max(bounds.maxY, y)
  }), {
    minX: Number.MAX_SAFE_INTEGER,
    minY: Number.MAX_SAFE_INTEGER,
    maxX: Number.MIN_SAFE_INTEGER,
    maxY: Number.MIN_SAFE_INTEGER
  });
  return bounds;
}

export function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width / 2}px`;
  canvas.style.height = `${height / 2}px`;
  // canvas.style.border = "1px solid red";
  document.body.appendChild(canvas);
  return canvas;
}

function getTextMetrics() {
  const width = 50;
  const height = 50;
  const fontSize = height / 2;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.font = `${fontSize}px sans-serif`;
  const x = width / 4;
  const y = height / 2;
  context.fillText("⬛", x, y);
  const bounds = getOpaqueBoundingBox(context, width, height);
  canvas.remove();

  const actualHeightRatio = (bounds.maxY - bounds.minY) / fontSize;
  const widthToSizeRatio = (bounds.maxX - bounds.minX) / fontSize;
  const xOffset = (bounds.minX - x) / fontSize;
  const yOffset = (bounds.maxY - y) / fontSize;

  return {
    actualHeightRatio,
    widthToSizeRatio,
    xOffset,
    yOffset
  };
}

export function getChar(dataPoint) {
  return dataPoint.keycode.split(" ")
    .map((s) => s.split("+")[1])
    .map((s) => parseInt(s, 16))
    .map((s) => String.fromCodePoint(s))
    .join("");
}

// Given a context, returns an array of lab color components for each pixel.
function getPixelData(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  return Array(width * height).fill(0).map((_, index) => {
    const baseIndex = index * 4,
      r = imageData.data[baseIndex],
      g = imageData.data[baseIndex + 1],
      b = imageData.data[baseIndex + 2],
      alphaRatio = imageData.data[baseIndex + 3] / 255,
      rFlat = r * alphaRatio + 255 * (1 - alphaRatio),
      gFlat = g * alphaRatio + 255 * (1 - alphaRatio),
      bFlat = b * alphaRatio + 255 * (1 - alphaRatio);
    return {
      x: index % width,
      y: Math.floor(index / width),
      transparent: alphaRatio < 0.1,
      rgbColor: {r: rFlat, g: gFlat, b: bFlat},
      color: convert.rgb.lab.raw(rFlat, gFlat, bFlat)
    };
  });
}

function getAvgColor(context, xOffset, yOffset, char, size=16) {
  context.clearRect(0, 0, size, size);
  context.fillText(char, -size * xOffset, size - size * yOffset);
  const pixelData = getPixelData(context, size, size);
  return pixelData.reduce(([a1, b1, c1], {color}) => {
    const [a2, b2, c2] = color;
    return [a1+a2, b1+b2, c1+c2];
  }, [0, 0, 0]).map((v) => v / pixelData.length);
}

function getColorData(data, metrics) {
  const SIZE = 16;
  const canvas = createCanvas(SIZE, SIZE);
  const context = canvas.getContext("2d");
  const fontSize = Math.round(SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;
  const colorData = data.map((point) => {
    const char = getChar(point);
    return getAvgColor(context, metrics.xOffset, metrics.yOffset, char, SIZE);
  });
  canvas.remove();
  return colorData;
}

export function getPixelDataForChar(char, metrics, size) {
  const canvas = createCanvas(size, size);
  const context = canvas.getContext("2d");
  const fontSize = Math.round(size / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;
  context.fillText(char, -size * metrics.xOffset, size - size * metrics.yOffset);
  const pixelData = getPixelData(context, size, size);
  canvas.remove();
  return pixelData;
}

export function getData(data) {
  const metrics = getTextMetrics();
  const colorData = getColorData(data, metrics);

  const dataMap = data.reduce((map, point, index) => {
    map[point.num] = {
      char: getChar(point),
      color: colorData[index],
      supported: true // TODO: implement this
    };
    return map;
  }, {});

  return {metrics, data: dataMap};
}
