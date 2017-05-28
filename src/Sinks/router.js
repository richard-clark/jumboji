import * as configUtils from "../configUtils.js";
import * as most from "most";

export function configToPath(config, emojiToNameMap) {
  let components = [];

  components.push(emojiToNameMap.nameForChar[config.emoji]);

  if (config.imageSize !== configUtils.INITIAL_CONFIG.imageSize) {
    components.push(`is-${config.imageSize}`);
  }

  if (config.background) {
    let background = config.background;
    const bgWithHashMatch = background.match(/^#(.*)$/);
    if (bgWithHashMatch) {
      background = bgWithHashMatch[1];
    }
    components.push(`bg-${background}`)
  }

  if (config.variation !== configUtils.INITIAL_CONFIG.variation) {
    components.push(`n-${config.variation}`);
  }

  if (config.padding) {
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
