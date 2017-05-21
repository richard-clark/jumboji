import "./main.scss";
import * as most from "most";
import * as utils from "./utils.js";
import Config$ from "./Streams/config.js";
import Data$ from "./Streams/data.js";
import Image$ from "./Streams/image.js";
import WorkerClient$ from "./Streams/workerClient.js";
import Img from "./Components/Img.js";
import Loader from "./Components/Loader.js";
import Nav from "./Components/Nav.js";
import {h} from "snabbdom/h";
import domSink from "./domSink.js";

const data$ = Data$({});

const documentReady$ = most.fromEvent("DOMContentLoaded", document);

const apperanceData$ = most.combine(utils.getData, data$, documentReady$);

const clickWithDataTarget$ = most.fromEvent("click", document)
  .map(getDataTarget)
  .filter((target) => target)
  .tap(() => console.log("click"))
  .multicast();

const config$ = Config$({data$, clickWithDataTarget$});

const workerClient$ = WorkerClient$({
  apperanceData$,
  config$
});

const dataToRender$ = workerClient$
  .filter(({data}) => data)
  .startWith({
    palette: [[128, 0, 0]]
  });
let nav = Nav({dataToRender$, config$});

let image$ = Image$({dataToRender$, apperanceData$, config$})
  .startWith(null);

let img = Img({image$, config$});

const initialLoading$ = apperanceData$
  .map(() => false)
  .startWith(true);
const workerLoading$ = workerClient$
  .map(({loading}) => loading)
  .startWith(false);
const loading$ = most.combine(
  (a, b) => a || b,
  initialLoading$,
  workerLoading$
);
let loader = Loader({ loading$ });

function main(navVnode, imgVnode, loaderVnode) {
  return h("main.main", {}, [
    navVnode,
    imgVnode,
    loaderVnode
  ])
}

let dom$ = most.combine(main, nav.dom$, img.dom$, loader.dom$);

domSink({dom$, documentReady$});

function getDataTarget(event) {
  // debugger
  console.log("get data target", event);
  let element = event.target;
  while (element) {
    if (Object.keys(element.dataset).length > 0) {
      return element.dataset;
    }
    element = element.parentElement;
  }
}
