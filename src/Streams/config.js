import * as utils from "../utils.js";
import * as most from "most";

export const INITIAL_CONFIG = {
  emoji: null,
  fullSize: false,
  imageSize: 24,
  tileSize: 32,
  maxVariation: 0.9,
  padding: true,
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
    .debounce(200)
    .multicast();

  return config$;

}
