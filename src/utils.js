import convert from "color-convert";

function getBiggestBoundingBox(bounds, {minX, minY, maxX, maxY}) {
  return {
    minX: Math.min(bounds.minX, minX),
    maxX: Math.max(bounds.maxX, maxX),
    minY: Math.min(bounds.minY, minY),
    maxY: Math.max(bounds.maxY, maxY)
  };
}

function getOpaqueBoundingBox(context, width, height) {
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
    minX: Math.min(bounds.minX, x-0.5),
    maxX: Math.max(bounds.maxX, x+0.5),
    minY: Math.min(bounds.minY, y-0.5),
    maxY: Math.max(bounds.maxY, y+0.5)
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
  return canvas;
}

function getTextMetrics() {
  const width = 50;
  const height = 50;
  const fontSize = height / 2;
  const canvas = createCanvas(width, height);
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  context.font = `${fontSize}px sans-serif`;
  const x = width / 4;
  const y = height / 2;

  // Different emoji have different bounds on different OSes, so get the bounds
  // of a couple different emoji and use the largest bounding box.
  const bounds = [
    "🔵", // macOS
    "🔗", // macOS
    "🌈" // windows
  ].map((char, index) => {
    if (index > 0) {
      context.clearRect(0, 0, width, height);
    }
    context.fillText(char, x, y);
    return getOpaqueBoundingBox(context, width, height);
  }).reduce(getBiggestBoundingBox);

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

function drawCharAndGetData(context, xOffset, yOffset, char, size=16) {
  context.clearRect(0, 0, size, size);
  context.fillText(char, -size * xOffset, size - size * yOffset);
  const pixelData = getPixelData(context, size, size);
  return pixelData;
}

function getAvgColor(pixelData) {
  return pixelData.reduce(([a1, b1, c1], {color}) => {
    const [a2, b2, c2] = color;
    return [a1+a2, b1+b2, c1+c2];
  }, [0, 0, 0]).map((v) => v / pixelData.length);
}

function getHash(pixelData) {
  return pixelData.map(({rgbColor}) =>
    [rgbColor.r, rgbColor.g, rgbColor.b].map((byte) =>
      String.fromCodePoint(Math.floor(byte))).join("")
  )
    .join("");
}

function getInfo(data, metrics) {
  const SIZE = 8;
  const canvas = createCanvas(SIZE, SIZE);
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  const fontSize = Math.round(SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;
  const info = data.map((point) => {
    const char = point.char;
    const pixelData = drawCharAndGetData(context, metrics.xOffset, metrics.yOffset, char, SIZE);
    const hash = getHash(pixelData);
    const color = getAvgColor(pixelData);
    const width = context.measureText(char).width / SIZE;
    return {color, hash, width};
  });
  canvas.remove();
  return info;
}

export function getPixelDataForChar(char, metrics, size) {
  const canvas = createCanvas(size, size);
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  const fontSize = Math.round(size / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;
  context.fillText(char, -size * metrics.xOffset, size - size * metrics.yOffset);
  const pixelData = getPixelData(context, size, size);
  canvas.remove();
  return pixelData;
}

// For each OS, each emoji has different widths and each missing glyph has
// different widths. Thus, we have to try to detect the OS and set this
// appropriately.
function getMaxCharWidth() {
  const userAgent = window.navigator.userAgent;

  if (userAgent.match(/Android/)) {
    return 1.1;
  } else if (userAgent.match(/Windows/)) {
    return 1.5;
  } else {
    // Assume macOS
    // Chrome: ~1.05
    // Safari: ~1.35 for some reason
    // Firefox: ~1.35
    return 1.4
  }

}

export function getData(data) {
  const metrics = getTextMetrics();
  const info = getInfo(data, metrics);

  const missingGlyphPixelData = getPixelDataForChar(String.fromCodePoint(0x124AB), metrics, 8);
  const missingGlyphHash = getHash(missingGlyphPixelData);
  const MAX_CHAR_WIDTH = getMaxCharWidth();

  const dataMap = data.reduce((map, point, index) => {

    const infoForPoint = info[index];
    const supported = infoForPoint.hash !== missingGlyphHash && infoForPoint.width < MAX_CHAR_WIDTH;

    map[point.char] = {
      char: point.char,
      color: infoForPoint.color,
      supported: supported
    };
    return map;
  }, {});

  return {metrics, data: dataMap};
}

export function rand(exclusiveMax) {
  return Math.floor(Math.random() * exclusiveMax);
}

export function getURLSafeName(name) {
  return name.replace(/\s+/g, "-")
    .replace(/&/g, "and")
    .replace(/:’/g, "-")
    .replace(/[.,!“()]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}
