import * as configUtils from "../configUtils.js";
import * as most from "most";

export function encodePath({emojiToNameMap, emoji, imageSize, background, variation, padding}) {
  let components = [];

  components.push(emojiToNameMap.nameForChar[emoji]);

  if (imageSize !== INITIAL_STATE.imageSize) {
    components.push(`is-${imageSize}`);
  }

  if (background) {
    const bgWithHashMatch = background.match(/^#(.*)$/);
    if (bgWithHashMatch) {
      background = bgWithHashMatch[1];
    }
    components.push(`bg-${background}`)
  }

  if (variation !== INITIAL_STATE.variation) {
    components.push(`n-${variation}`);
  }

  if (padding) {
    components.push("padding");
  }

  components.reverse();
  return "/" + components.join("/");
}

export default function({history, config$, emojiToNameMap$}) {

  most.combine(
    (config, emojiToNameMap) => ({config, emojiToNameMap}),
    config$,
    emojiToNameMap$
  )
  .filter(({config}) => config.parsedRouteFromConfig)
  .observe(({config, emojiToNameMap}) => {
    const path = "#" + configToPath(config, emojiToNameMap);
    if (path === history.location.hash) {
      return;
    }
    history.push(path, {});
  });

}
