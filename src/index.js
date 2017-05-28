import * as most from "most";
import * as utils from "./utils.js";
import {h} from "snabbdom/h";
import createHistory from "history/createBrowserHistory";

import Img from "./Components/Img.js";
import Loader from "./Components/Loader.js";
import Nav from "./Components/Nav.js";

import Config$ from "./Streams/config.js";
import Data$ from "./Streams/data.js";
import {DocumentReady$, ClickWithDataTarget$} from "./Streams/dom.js";
import {VisibleDropdown$} from "./Streams/dropdown.js";
import EmojiToNameMap$ from "./Streams/emojiToNameMap.js";
import ImageBlob$ from "./Streams/image.js";
import {Loading$, InitialLoading$} from "./Streams/loading.js";
import {DataMatchingSearch$, SearchAction$, SearchParams$} from "./Streams/search.js";
import StateAction$ from "./Streams/stateAction.js";
import WorkerClient$ from "./Streams/workerClient.js";

import domSink from "./Sinks/dom.js";
import routerSink from "./Sinks/router.js";

import "./main.scss";

const history = createHistory();

const allData$ = Data$({});

function filterUnsupported(data, appearanceData) {
  return data.filter((point) => appearanceData.data[point.char].supported);
}

const documentReady$ = DocumentReady$();

const appearanceData$ = most.combine(utils.getData, allData$, documentReady$)
  .multicast();

const data$ = most.combine(filterUnsupported, allData$, appearanceData$)
  .multicast();

const emojiToNameMap$ = EmojiToNameMap$({data$});
const stateAction$ = StateAction$({history, emojiToNameMap$, data$});

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
  stateAction$,
  searchAction$
});

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

let initialLoading$ = InitialLoading$({appearanceData$});
let loading$ = Loading$({initialLoading$, workerClient$});
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

let dom$ = most.combine(main, nav.dom$, img.dom$, loader.dom$);

routerSink({history, config$, emojiToNameMap$});
domSink({dom$, documentReady$});
