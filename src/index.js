import "./main.scss";
import * as most from "most";
import * as utils from "./utils.js";
import Config$ from "./Streams/config.js";
import Data$ from "./Streams/data.js";
import ImageBlob$ from "./Streams/image.js";
import {DataMatchingSearch$, SearchAction$, SearchParams$} from "./Streams/search.js";
import WorkerClient$ from "./Streams/workerClient.js";
import {DocumentReady$, ClickWithDataTarget$} from "./Streams/dom.js";
import Img from "./Components/Img.js";
import Loader from "./Components/Loader.js";
import Nav from "./Components/Nav.js";
import {h} from "snabbdom/h";
import domSink from "./domSink.js";
import * as routerUtils from "./routerUtils.js";
import {VisibleDropdown$} from "./Streams/dropdown.js";

const allData$ = Data$({});

function filterUnsupported(data, appearanceData) {
  return data.filter((point) => appearanceData.data[point.char].supported);
}

const documentReady$ = DocumentReady$();

const appearanceData$ = most.combine(utils.getData, allData$, documentReady$)
  .multicast();

const data$ = most.combine(filterUnsupported, allData$, appearanceData$)
  .multicast();

const routerInterface = routerUtils.makeInterface({data$});

const clickWithDataTarget$ = ClickWithDataTarget$();

const searchAction$ = SearchAction$({clickWithDataTarget$});
const searchParams$ = SearchParams$({clickWithDataTarget$, searchAction$});
const dataMatchingSearch$ = DataMatchingSearch$({
  searchParams$,
  data$: data$.startWith([])
});

const config$ = Config$({
  data$,
  clickWithDataTarget$,
  initialConfig$: routerInterface.initialConfig$,
  stateAction$: routerInterface.stateAction$,
  searchAction$
});
routerInterface.observe(config$);

const workerClient$ = WorkerClient$({
  appearanceData$,
  config$
});

const dataToRender$ = workerClient$
  .scan((previous, current) => ({
    data: current.data,
    palette: current.palette || previous.palette
  }), {})
  .startWith({})
  .multicast();

let imageBlob$ = ImageBlob$({dataToRender$, appearanceData$, config$})
  .startWith(null);

let img = Img({imageBlob$, config$});

const initialLoading$ = appearanceData$
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

const visibleDropdown$ = VisibleDropdown$({clickWithDataTarget$});

let nav = Nav({
  dataToRender$,
  config$,
  initialLoading$,
  imageBlob$,
  visibleDropdown$,
  dataMatchingSearch$,
  searchParams$
});

function main(navVnode, imgVnode, loaderVnode) {
  return h("main.main", {key: "main"}, [
    navVnode,
    imgVnode,
    loaderVnode
  ])
}

// let dom$ = most.combine(main, nav.dom$, img.dom$, loader.dom$);

let dom$ = most.combine(main, nav.dom$, img.dom$, loader.dom$);

domSink({dom$, documentReady$});
