import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import * as utils from "./utils.js";
import sagas from "./sagas.js";

const initialState = {
  emoji: "🌈",
  fullSize: false,
  imageSize: 32,
  tileSize: 32,
  variation: 5,
  padding: false,
  background: null,
  // Prevents config changes from updating the route until we're certain that
  // we've initially read the configuration from the route.
  // parsedRouteFromConfig: false,

  data: [],
  searchQuery: "",
  searchResults: null,
  initialLoading: false,
  workerLoading: false,
  visibleDropdown: null,
  appearanceData: null,
  emojiToNameMap: null,

  imageData: null,
  palette: null,
  imageUrl: null
};

const ACTIONS = new Set([
  "CLOSE_DROPDOWN",
  "DOCUMENT_READY",
  "LOAD_DATA_REQUEST",
  "LOAD_DATA_SUCCESS",
  "LOAD_DATA_ERROR",
  "RANDOMIZE",
  "SET_BACKGROUND",
  "SET_EMOJI",
  "SET_IMAGE_SIZE",
  "SET_PADDING",
  "SET_TILE_SIZE",
  "SET_VARIATION",
  "TOGGLE_FULL_SIZE",
  "UPDATE_SEARCH_QUERY"
]);

/*
export function getRandomEmoji(data) {
  const point = data[utils.rand(data.length)];
  return {
    action: "set-emoji",
    emoji: point.char
  };
}

*/

function emojiToNameMap(data) {
  return data.reduce(
    (map, point) => {
      const char = point.char;
      const name = utils.getURLSafeName(point.name);
      map.nameForChar[char] = name;
      map.charForName[name] = char;
      return map;
    },
    {
      nameForChar: {},
      charForName: {}
    }
  );
}

function search(data, query) {
  query = query.trim().toLowerCase();
  let results = data;

  if (query.length > 0) {
    results = data.filter(point => {
      return (
        query === point.char ||
        point.name.toLowerCase().indexOf(query) >= 0 ||
        point.keywords.some(keyword => keyword.indexOf(query) >= 0)
      );
    });
  }

  return {
    hasData: data.length > 0,
    results: results.slice(0, 19).map(point => ({
      name: point.name,
      emoji: point.char
    })),
    totalResults: results.length
  };
}

function filterUnsupported(data, appearanceData) {
  return data.filter(point => appearanceData.data[point.char].supported);
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case "CLOSE_DROPDOWN":
      return {
        ...state,
        visibleDropdown: null
      };

    case "LOAD_DATA_REQUEST":
      return {
        ...state,
        initialLoading: true
      };

    case "LOAD_DATA_ERROR":
      return {
        ...state,
        initialLoading: false
      };

    case "LOAD_DATA_SUCCESS":
      const appearanceData = utils.getData(action.data.data);
      const data = filterUnsupported(action.data.data, appearanceData);
      return {
        ...state,
        initialLoading: false,
        data,
        appearanceData,
        emojiToNameMap: emojiToNameMap(data),
        searchResults: search(data, state.searchQuery)
      };

    case "SET_BACKGROUND":
      return {
        ...state,
        background: action.data.background
      };

    case "SET_EMOJI":
      return {
        ...state,
        emoji: action.data.emoji
      };

    case "SET_IMAGE_SIZE":
      return {
        ...state,
        imageSize: action.data.imageSize
      };

    case "SET_PADDING":
      return {
        ...state,
        padding: action.data.padding
      };

    case "SET_VARIATION":
      return {
        ...state,
        variation: action.data.variation
      };

    case "SHOW_DROPDOWN":
      return {
        ...state,
        visibleDropdown:
          action.data.name === state.visibleDropdown ? null : action.data.name
      };

    case "TOGGLE_FULL_SIZE":
      return {
        ...state,
        fullSize: !state.fullSize
      };

    case "UPDATE_IMAGE":
      return {
        ...state,
        imageUrl: action.data.imageUrl
      };

    case "UPDATE_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.data.query,
        searchResults: search(state.data, action.data.query)
      };

    case "WORKER_COMPLETE":
      return {
        ...state,
        workerLoading: false,
        palette: action.data.palette,
        imageData: action.data.imageData
      };

    case "WORKER_STARTED":
      return {
        ...state,
        workerLoading: true
      };

    default:
      return state;
  }
}

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);
sagaMiddleware.run(sagas);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    store.dispatch({ type: "DOCUMENT_READY" });
  }, 200);
});

/*
function getParentDropdown(event) {
  let element = event.target;
  while (element) {
    if (element.dataset && element.dataset.dropdown) {
      return element.dataset.dropdown;
    }
    element = element.parentElement;
  }
}
*/

document.addEventListener("keyup", e => {
  if (e.keyCode === 27) {
    e.preventDefault();
    store.dispatch({ type: "CLOSE_DROPDOWN" });
  }
});

export default store;

/*
import * as configUtils from "../configUtils.js";
import * as most from "most";

export default function Config$({
  data$,
  clickWithDataTarget$,
  stateAction$,
  searchAction$
}) {

  const clickAction$ = clickWithDataTarget$
    .filter(({action}) => action);

  const randomizeAction$ = most.combine(
    configUtils.getRandomEmoji,
    data$,
    clickWithDataTarget$
      .filter(({trigger}) => trigger === "randomize")
  ).multicast();

  const _searchAction$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "search-result")
    .filter((action) => action.emoji)
    .map((action) => ({action: "set-emoji", emoji: action.emoji}));

  const config$ = most.merge(stateAction$, clickAction$, _searchAction$, randomizeAction$)
    .scan(configUtils.actionReducer, configUtils.INITIAL_CONFIG)
    .skipRepeatsWith(configUtils.objectsAreEqual)
    .debounce(200)
    .startWith({})
    .multicast();

  return config$;

}

*/
