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
  // context.fillText("⬛", x, y);
  // context.fillText("🔵", x, y);
  context.fillText("🏞️", x, y);
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

// From: http://unicode.org/emoji/charts/emoji-variants.html#0023
const EMOJI_WITH_VARIANTS = new Set([
  0x0023, 0x002A, 0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035, 0x0036,
  0x0037, 0x0038, 0x0039, 0x00A9, 0x00AE, 0x203C, 0x2049, 0x2122, 0x2139,
  0x2194, 0x2195, 0x2196, 0x2197, 0x2198, 0x2199, 0x21A9, 0x21AA, 0x231A,
  0x231B, 0x2328, 0x23CF, 0x23E9, 0x23EA, 0x23ED, 0x23EE, 0x23EF, 0x23F1,
  0x23F2, 0x23F3, 0x23F8, 0x23F9, 0x23FA, 0x24C2, 0x25AA, 0x25AB, 0x25B6,
  0x25C0, 0x25FB, 0x25FC, 0x25FD, 0x25FE, 0x2600, 0x2601, 0x2602, 0x2603,
  0x2604, 0x260E, 0x2611, 0x2614, 0x2615, 0x2618, 0x261D, 0x2620, 0x2622,
  0x2623, 0x2626, 0x262A, 0x262E, 0x262F, 0x2638, 0x2639, 0x263A, 0x2640,
  0x2642, 0x2648, 0x2649, 0x264A, 0x264B, 0x264C, 0x264D, 0x264E, 0x264F,
  0x2650, 0x2651, 0x2652, 0x2653, 0x2660, 0x2663, 0x2665, 0x2666, 0x2668,
  0x267B, 0x267F, 0x2692, 0x2693, 0x2694, 0x2695, 0x2696, 0x2697, 0x2699,
  0x269B, 0x269C, 0x26A0, 0x26A1, 0x26AA, 0x26AB, 0x26B0, 0x26B1, 0x26BD,
  0x26BE, 0x26C4, 0x26C5, 0x26C8, 0x26CF, 0x26D1, 0x26D3, 0x26D4, 0x26E9,
  0x26EA, 0x26F0, 0x26F1, 0x26F2, 0x26F3, 0x26F4, 0x26F5, 0x26F7, 0x26F8,
  0x26F9, 0x26FA, 0x26FD, 0x2702, 0x2708, 0x2709, 0x270C, 0x270D, 0x270F,
  0x2712, 0x2714, 0x2716, 0x271D, 0x2721, 0x2733, 0x2734, 0x2744, 0x2747,
  0x2753, 0x2757, 0x2763, 0x2764, 0x27A1, 0x2934, 0x2935, 0x2B05, 0x2B06,
  0x2B07, 0x2B1B, 0x2B1C, 0x2B50, 0x2B55, 0x3030, 0x303D, 0x3297, 0x3299,
  0x1F004, 0x1F170, 0x1F171, 0x1F17E, 0x1F17F, 0x1F202, 0x1F21A, 0x1F22F,
  0x1F237, 0x1F30D, 0x1F30E, 0x1F30F, 0x1F315, 0x1F31C, 0x1F321, 0x1F324,
  0x1F325, 0x1F326, 0x1F327, 0x1F328, 0x1F329, 0x1F32A, 0x1F32B, 0x1F32C,
  0x1F336, 0x1F378, 0x1F37D, 0x1F393, 0x1F396, 0x1F397, 0x1F399, 0x1F39A,
  0x1F39B, 0x1F39E, 0x1F39F, 0x1F3A7, 0x1F3AC, 0x1F3AD, 0x1F3AE, 0x1F3C2,
  0x1F3C4, 0x1F3C6, 0x1F3CA, 0x1F3CB, 0x1F3CC, 0x1F3CD, 0x1F3CE, 0x1F3D4,
  0x1F3D5, 0x1F3D6, 0x1F3D7, 0x1F3D8, 0x1F3D9, 0x1F3DA, 0x1F3DB, 0x1F3DC,
  0x1F3DD, 0x1F3DE, 0x1F3DF, 0x1F3E0, 0x1F3ED, 0x1F3F3, 0x1F3F5, 0x1F3F7,
  0x1F408, 0x1F415, 0x1F41F, 0x1F426, 0x1F43F, 0x1F441, 0x1F442, 0x1F446,
  0x1F447, 0x1F448, 0x1F449, 0x1F44D, 0x1F44E, 0x1F453, 0x1F46A, 0x1F47D,
  0x1F4A3, 0x1F4B0, 0x1F4B3, 0x1F4BB, 0x1F4BF, 0x1F4CB, 0x1F4DA, 0x1F4DF,
  0x1F4E4, 0x1F4E5, 0x1F4E6, 0x1F4EA, 0x1F4EB, 0x1F4EC, 0x1F4ED, 0x1F4F7,
  0x1F4F9, 0x1F4FA, 0x1F4FB, 0x1F4FD, 0x1F508, 0x1F50D, 0x1F512, 0x1F513,
  0x1F549, 0x1F54A, 0x1F550, 0x1F551, 0x1F552, 0x1F553, 0x1F554, 0x1F555,
  0x1F556, 0x1F557, 0x1F558, 0x1F559, 0x1F55A, 0x1F55B, 0x1F55C, 0x1F55D,
  0x1F55E, 0x1F55F, 0x1F560, 0x1F561, 0x1F562, 0x1F563, 0x1F564, 0x1F565,
  0x1F566, 0x1F567, 0x1F56F, 0x1F570, 0x1F573, 0x1F574, 0x1F575, 0x1F576,
  0x1F577, 0x1F578, 0x1F579, 0x1F587, 0x1F58A, 0x1F58B, 0x1F58C, 0x1F58D,
  0x1F590, 0x1F5A5, 0x1F5A8, 0x1F5B1, 0x1F5B2, 0x1F5BC, 0x1F5C2, 0x1F5C3,
  0x1F5C4, 0x1F5D1, 0x1F5D2, 0x1F5D3, 0x1F5DC, 0x1F5DD, 0x1F5DE, 0x1F5E1,
  0x1F5E3, 0x1F5E8, 0x1F5EF, 0x1F5F3, 0x1F5FA, 0x1F610, 0x1F687, 0x1F68D,
  0x1F691, 0x1F694, 0x1F698, 0x1F6AD, 0x1F6B2, 0x1F6B9, 0x1F6BA, 0x1F6BC,
  0x1F6CB, 0x1F6CD, 0x1F6CE, 0x1F6CF, 0x1F6E0, 0x1F6E1, 0x1F6E2, 0x1F6E3,
  0x1F6E4, 0x1F6E5, 0x1F6E9, 0x1F6F0, 0x1F6F3
]);
const VARIANT_CHAR = String.fromCodePoint(0xFE0F);

export function getChar(dataPoint) {
  return dataPoint.keycode.split(" ")
    .map((s) => s.split("+")[1])
    .map((s) => parseInt(s, 16))
    .map((s) => String.fromCodePoint(s) + (EMOJI_WITH_VARIANTS.has(s) ? VARIANT_CHAR : ""))
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

export function rand(exclusiveMax) {
  return Math.floor(Math.random() * exclusiveMax);
}
