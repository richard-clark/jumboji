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

export default function Config$({data$, clickWithDataTarget$, emojiInput$, stateAction$}) {

  const clickAction$ = clickWithDataTarget$
    .filter(({action}) => action)
    .tap((config) => console.log("click action"));

  const randomizeAction$ = most.combine(
    getRandomEmoji,
    data$,
    clickWithDataTarget$
      .filter(({trigger}) => trigger === "randomize")
  ).tap(() => console.log("randomize action"));

  const emojiInputAction$ = emojiInput$
    .filter((action) => action.valid)
    .map((action) => ({action: "set-emoji", emoji: action.char}));

  const config$ = most.merge(stateAction$, clickAction$, randomizeAction$, emojiInputAction$)
    .scan(actionReducer, INITIAL_CONFIG)
    .debounce(200)
    .tap((config) => console.log(config))
    .multicast();

  return config$;

}