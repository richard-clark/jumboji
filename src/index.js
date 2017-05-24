import "./main.scss";
import * as most from "most";
import * as utils from "./utils.js";
import Config$ from "./Streams/config.js";
import Data$ from "./Streams/data.js";
import Image$ from "./Streams/image.js";
import {DataMatchingSearch$, SearchAction$, SearchParams$} from "./Streams/search.js";
import WorkerClient$ from "./Streams/workerClient.js";
import GenericModal$ from "./Streams/genericModal.js";
import {DocumentReady$, ClickWithDataTarget$} from "./Streams/dom.js";
import GenericModal from "./Components/GenericModal.js";
import Img from "./Components/Img.js";
import Loader from "./Components/Loader.js";
import Nav from "./Components/Nav.js";
import Search from "./Components/Search.js";
import Settings from "./Components/Settings.js";
import {h} from "snabbdom/h";
import domSink from "./domSink.js";
import * as routerUtils from "./routerUtils.js";

const allData$ = Data$({});

function filterUnsupported(data, appearanceData) {
  return data.filter((point) => appearanceData.data[point.num].supported);
}

const documentReady$ = DocumentReady$();

const appearanceData$ = most.combine(utils.getData, allData$, documentReady$)
  .multicast();

const data$ = most.combine(filterUnsupported, allData$, appearanceData$)
  .multicast();

const routerInterface = routerUtils.makeInterface({data$});

const clickWithDataTarget$ = ClickWithDataTarget$();

const genericModal$ = GenericModal$({allData$, appearanceData$, clickWithDataTarget$});

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

let image$ = Image$({dataToRender$, appearanceData$, config$})
  .startWith(null);

let img = Img({image$, config$});

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

let nav = Nav({
  dataToRender$,
  config$,
  initialLoading$,
  image$
});

let loader = Loader({ loading$ });

let search = Search({ dataMatchingSearch$, searchParams$ });

const settingsMenuVisible$ = most.merge(

  most.fromEvent("keyup", document)
    .filter((event) => event.keyCode === 27)
    .map(() => false),

  routerInterface.stateAction$
    .map(() => false),

  clickWithDataTarget$
    .filter(({trigger}) => trigger === "close-settings-menu")
    .map(() => false),

  clickWithDataTarget$
    .filter(({trigger}) => trigger === "show-settings-menu")
    .map(() => true)

).startWith(false).multicast();

let settings = Settings({config$, settingsMenuVisible$});

let genericModal = GenericModal({genericModal$});

function main(navVnode, imgVnode, loaderVnode, searchVnode, settingsVnode, genericModalVnode) {
  return h("main.main", {key: "main"}, [
    navVnode,
    imgVnode,
    loaderVnode,
    searchVnode,
    settingsVnode,
    genericModalVnode
  ])
}

let dom$ = most.combine(main, nav.dom$, img.dom$, loader.dom$, search.dom$, settings.dom$, genericModal.dom$);

domSink({dom$, documentReady$});
