import * as utils from "../utils.js";
import * as most from "most";

export const INITIAL_CONFIG = {
  emoji: "🌈",
  fullSize: false,
  imageSize: 24,
  tileSize: 32,
  sampleNeighbors: 5,
  padding: false,
  background: null
};

export function actionReducer(state, event) {
  switch (event.action) {
    case "set-background":
      return {...state, background: event.background};
    case "set-emoji":
      return {...state, emoji: event.emoji}
    case "set-image-size":
      return {...state, imageSize: parseInt(event.size)};
    case "set-tile-size":
      return {...state, tileSize: parseInt(event.size)};
    case "toggle-full-size":
      return {...state, fullSize: !state.fullSize};
    case "set-padding":
      return {...state, padding: Boolean(event.padding)};
    case "set-neighbors":
      return {...state, sampleNeighbors: parseInt(event.sampleNeighbors)};
    default:
      return state;
  }
}

function getRandomEmoji(data) {
  const point = data[utils.rand(data.length)];
  return {
    action: "set-emoji",
    emoji: utils.getChar(point)
  };
}

function objectsAreEqual(obj1, obj2) {
  if (obj1 === obj2)  { return true; }
  if (obj1 && !obj2 || obj2 && !obj1) { return false; }
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);
  return obj1Keys.length === obj2Keys.length
    && obj1Keys.every((key) => obj1[key] === obj2[key]);
}

export default function Config$({
  data$,
  clickWithDataTarget$,
  stateAction$,
  searchAction$,
  initialConfig$
}) {

  const clickAction$ = clickWithDataTarget$
    .filter(({action}) => action);

  const randomizeAction$ = most.combine(
    getRandomEmoji,
    data$,
    clickWithDataTarget$
      .filter(({trigger}) => trigger === "randomize")
  ).multicast();

  const _searchAction$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "search-result")
    .filter((action) => action.emoji)
    .map((action) => ({action: "set-emoji", emoji: action.emoji}));

  // Not sure why this is necessary, but the streams don't emit events (when
  // merged, see below) unless they're observed.
  stateAction$.drain();
  randomizeAction$.drain();

  const config$ = initialConfig$
    .take(1)
    .continueWith((initialConfig) => {
      return most.merge(stateAction$, clickAction$, _searchAction$, randomizeAction$)
        .scan(actionReducer, initialConfig);
    })
    .skipRepeatsWith(objectsAreEqual)
    .debounce(200)
    .startWith({})
    .multicast();

  return config$;

}
