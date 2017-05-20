import dataUrl from "./data.json";
import * as utils from "./utils.js";
import * as most from "most";
import Worker from "./worker.js";
import "./main.scss";
import convert from "color-convert";

const link = document.createElement("link")
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

function loadData() {
  return fetch(dataUrl).then((response) => response.json());
}

const data$ = most.fromPromise(loadData());

const documentReady$ = most.fromEvent("DOMContentLoaded", document);

function getApperanceData(data) {
  return utils.getData(data);
}

const apperanceData$ = most.combine(getApperanceData, data$, documentReady$);

function getRandomEmoji(data) {
  const point = data[rand(data.length)];
  return utils.getChar(point);
}

const randomize$ = most.fromEvent("click", document)
  .filter((event) => event.target.classList.contains("randomize")
    || event.target.parentElement.classList.contains("randomize"));

const dataToRender$ = most.combine(getRandomEmoji, data$, randomize$)
  .startWith("🌈")
  .map((char) => ({
    char,
    imageSize: 64,
    tileSize: 24,
    maxVariation: 0.9
  }));

function rand(exclusiveMax) {
  return Math.floor(Math.random() * exclusiveMax);
}

const worker = new Worker();
const outputData$ = most.fromEvent("message", worker)
  .map((message) => message.data);

outputData$.observe((event) => {
  if (event.loading) {
    document.querySelector(".main").classList.add("main--loading");
  } else {
    document.querySelector(".main").classList.remove("main--loading");
  }
});

const workerData$ = most.combine(generateDataToRender, apperanceData$, dataToRender$);
workerData$.observe((event) => worker.postMessage(event));

function generateDataToRender(apperanceData, config) {
  const pixelData = utils.getPixelDataForChar(
    config.char,
    apperanceData.metrics,
    config.imageSize
  );
  return {
    apperanceData,
    pixelData,
    maxVariation: config.maxVariation
  };
}

let emojiImage = null;

function renderEmoji(data, palette, metrics, {tileSize, imageSize}) {
  const color = palette[0];
  document.querySelector(".main__nav")
    .style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  const hslColor = convert.rgb.hsl(color);
  let fgColor = "#eee";
  if (hslColor[2] > 50) {
    fgColor = "#111";
  }
  document.querySelector(".main__nav")
    .style.color = fgColor;



  let padding = 5;
  let width = tileSize * imageSize + (imageSize - 1) * padding;
  let height = tileSize * imageSize + (imageSize - 1) * padding;
  const TILE_SIZE = tileSize;
  if (emojiImage) { emojiImage.remove(); }
  const emojiCanvas = utils.createCanvas(width, height);
  const context = emojiCanvas.getContext("2d");
  const fontSize = Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;
  context.strokeColor = "red";

  for (let {x, y, item} of data) {
    context.fillText(item.char, x * TILE_SIZE + x * padding - TILE_SIZE * metrics.xOffset, y * TILE_SIZE + TILE_SIZE + y * padding - TILE_SIZE * metrics.yOffset);
  }

  const image = emojiCanvas.toDataURL("image/png");
  emojiCanvas.remove();
  emojiImage = document.createElement("img");
  emojiImage.classList.add("img-container__img");
  emojiImage.src = image;
  document.querySelector(".img-container").appendChild(emojiImage);
}

most.combine(
  ({data, palette}, {metrics}, config) => ({data, palette, metrics, config}),
  outputData$.filter(({data}) => data),
  apperanceData$,
  dataToRender$
).observe(({data, palette, metrics, config}) => renderEmoji(data, palette, metrics, config));

documentReady$.observe(() => {
  const main = document.createElement("main");
  main.classList.add("main");
  main.innerHTML = `
    <nav class="main__nav">
      <h3>Hello World!</h3>
    </nav>
    <div class="main__content img-container">

    </div>
    <div class="main__loader">
      <div class="sk-cube-grid">
        <div class="sk-cube sk-cube1"></div>
        <div class="sk-cube sk-cube2"></div>
        <div class="sk-cube sk-cube3"></div>
        <div class="sk-cube sk-cube4"></div>
        <div class="sk-cube sk-cube5"></div>
        <div class="sk-cube sk-cube6"></div>
        <div class="sk-cube sk-cube7"></div>
        <div class="sk-cube sk-cube8"></div>
        <div class="sk-cube sk-cube9"></div>
      </div>
    </div>
  `;
  document.body.appendChild(main);

  const nav = main.querySelector(".main__nav");
  const button = document.createElement("button");
  button.classList.add("icon-btn");
  button.classList.add("randomize");
  button.innerHTML = '<i class="material-icons">refresh</i>'
  nav.appendChild(button);

});

document.addEventListener("click", (event) => {
  let target = event.target;
  if (target.classList.contains("img-container__img")) {
    target = target.parentElement;
  }

  if (target.classList.contains("img-container")) {
    if (target.classList.contains("img-container--full-size")) {
      target.classList.remove("img-container--full-size");
    } else {
      target.classList.add("img-container--full-size");
    }
  }
});
