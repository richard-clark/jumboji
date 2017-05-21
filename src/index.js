import "./main.scss";
import * as most from "most";
import * as utils from "./utils.js";
import Config$ from "./Streams/config.js";
import Data$ from "./Streams/data.js";
import Image$ from "./Streams/image.js";
import Router$ from "./Streams/router.js";
import WorkerClient$ from "./Streams/workerClient.js";
import {DocumentReady$, ClickWithDataTarget$} from "./Streams/dom.js";
import Img from "./Components/Img.js";
import Loader from "./Components/Loader.js";
import Nav from "./Components/Nav.js";
import {h} from "snabbdom/h";
import domSink from "./domSink.js";

const data$ = Data$({});

const documentReady$ = DocumentReady$();
const clickWithDataTarget$ = ClickWithDataTarget$();

const apperanceData$ = most.combine(utils.getData, data$, documentReady$);

const config$ = Config$({data$, clickWithDataTarget$});

const workerClient$ = WorkerClient$({
  apperanceData$,
  config$
});

const dataToRender$ = workerClient$
  .scan((previous, current) => ({
    data: current.data,
    palette: current.palette || previous.palette
  }), {
    palette: [[255, 255, 255]]
  })
  .startWith({
    palette: [[255, 255, 255]]
  })
  .multicast();

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

let nav = Nav({dataToRender$, config$, initialLoading$, image$});

let loader = Loader({ loading$ });

function main(navVnode, imgVnode, loaderVnode) {
  return h("main.main", {key: "main"}, [
    navVnode,
    imgVnode,
    loaderVnode
  ])
}

let dom$ = most.combine(main, nav.dom$, img.dom$, loader.dom$);

domSink({dom$, documentReady$});

const router$ = Router$({});
router$.observe((location) => console.log("router", location));
