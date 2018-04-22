import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware from "redux-saga";
import * as utils from "./utils.js";
import sagas from "./sagas.js";

export const INITIAL_STATE = {
  emoji: "🌈",
  fullSize: false,
  imageSize: 32,
  tileSize: 32,
  variation: 5,
  padding: false,
  background: null,

  data: [],
  searchQuery: "",
  searchResults: null,
  initialLoading: false,
  workerLoading: false,
  visibleDropdown: null,
  appearanceData: null,
  emojiToNameMap: null,
  workerProgress: 0,

  imageData: [],
  palette: null,
  imageUrl: null,

  // Prevents config changes from updating the route until we're certain that
  // we've initially read the configuration from the route.
  // parsedRouteFromConfig: false,
  routerStateInitialized: false
};

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

function reducer(state = INITIAL_STATE, action) {
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

    case "RENDER_COMPLETE":
      return {
        ...state,
        downloadUrl: action.data.downloadUrl
      };

    case "RENDER_STARTED":
      return {
        ...state,
        downloadUrl: null
      };

    case "ROUTER_STATE_INITIALIZED":
      return {
        ...state,
        routerStateInitialized: true
      };

    case "SET_BACKGROUND":
      return {
        ...state,
        background: action.data.background
      };

    case "SET_CONFIG":
      return {
        ...state,
        ...action.data
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
        visibleDropdown: action.data.name
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
        imageData: action.data.imageData,
        workerProgress: 1
      };

    case "WORKER_UPDATED":
      return {
        ...state,
        workerProgress: action.data.workerProgress
      };

    case "WORKER_STARTED":
      return {
        ...state,
        workerProgress: 0,
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
  window.setTimeout(() => {
    store.dispatch({ type: "DOCUMENT_READY" });
  }, 200);
});

document.addEventListener("keyup", e => {
  if (e.keyCode === 27) {
    e.preventDefault();
    store.dispatch({ type: "CLOSE_DROPDOWN" });
  }
});

export default store;
