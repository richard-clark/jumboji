import * as utils from "./utils.js";
import * as most from "most";

export const INITIAL_CONFIG = {
  emoji: "🌈",
  fullSize: false,
  imageSize: 32,
  tileSize: 32,
  variation: 5,
  padding: false,
  background: null,
  // Prevents config changes from updating the route until we're certain that
  // we've initially read the configuration from the route.
  parsedRouteFromConfig: false
};

/*
Since these actions are set on DOM elements with dataset (which needs to have
string keys), all values are strings and need to be converted to other types.
*/
export function actionReducer(state, event) {
  console.log(event);
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
      return {...state, padding: event.padding === "true"};
    case "set-variation":
      return {...state, variation: parseInt(event.variation)};
    case "parsed-route-from-config":
      return {...state, parsedRouteFromConfig: true };
    default:
      return state;
  }
}

export function getRandomEmoji(data) {
  const point = data[utils.rand(data.length)];
  return {
    action: "set-emoji",
    emoji: point.char
  };
}

export function objectsAreEqual(obj1, obj2) {
  if (obj1 === obj2)  { return true; }
  if (obj1 && !obj2 || obj2 && !obj1) { return false; }
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);
  return obj1Keys.length === obj2Keys.length
    && obj1Keys.every((key) => obj1[key] === obj2[key]);
}
