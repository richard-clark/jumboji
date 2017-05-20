import * as utils from "../utils.js";
import * as most from "most";

const INITIAL_CONFIG = {
  emoji: "🌈",
  fullSize: false,
  imageSize: 32,
  tileSize: 32
};

function actionReducer(state, event) {
  if (event.action === "toggle-full-size") {
    return Object.assign({}, state, {
      fullSize: !state.fullSize
    });
  } else if (event.action === "set-image-size") {
    return Object.assign({}, state, {
      imageSize: parseInt(event.size)
    });
  } else if (event.action === "set-tile-size") {
    return Object.assign({}, state, {
      tileSize: parseInt(event.size)
    });
  } else if (event.action === "set-emoji") {
    return Object.assign({}, state, {
      emoji: event.emoji
    });
  } else {
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

export default function Config$({data$, clickWithDataTarget$}) {

  const clickAction$ = clickWithDataTarget$
    .filter(({action}) => action);

  const randomizeAction$ = most.combine(
    getRandomEmoji,
    data$,
    clickWithDataTarget$
      .filter(({trigger}) => trigger === "randomize")
  );

  return most.merge(clickAction$, randomizeAction$)
    .scan(actionReducer, INITIAL_CONFIG)
    .tap((config) => console.log(config));

}
