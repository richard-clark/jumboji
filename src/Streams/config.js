import * as utils from "../utils.js";
import * as most from "most";

export const INITIAL_CONFIG = {
  emoji: "🌈",
  fullSize: false,
  imageSize: 24,
  tileSize: 32,
  maxVariation: 0.9,
  padding: false,
  background: null
};

function actionReducer(state, event) {
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

export default function Config$({data$, clickWithDataTarget$, emojiInput$, stateAction$, searchAction$}) {

  const clickAction$ = clickWithDataTarget$
    .filter(({action}) => action);

  const randomizeAction$ = most.combine(
    getRandomEmoji,
    data$,
    clickWithDataTarget$
      .filter(({trigger}) => trigger === "randomize")
  );

  const emojiInputAction$ = emojiInput$
    .filter((action) => action.valid)
    .map((action) => ({action: "set-emoji", emoji: action.char}));

  const _searchAction$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "search-result")
    .filter((action) => action.emoji)
    .map((action) => ({action: "set-emoji", emoji: action.emoji}));

  const config$ = most.merge(stateAction$, clickAction$, randomizeAction$, emojiInputAction$, _searchAction$)
    .scan(actionReducer, INITIAL_CONFIG)
    .skipRepeatsWith((a, b) => {
      const areEqual = objectsAreEqual(a, b);
      console.log("Are equal", areEqual, a, b);
      return areEqual;
    })
    .debounce(200)
    .multicast();

  return config$;

}
