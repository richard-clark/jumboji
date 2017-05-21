import {INITIAL_CONFIG} from "./Streams/config.js";
import * as utils from "./utils.js";

export function EmojiToNameMap$({data$}) {
  return data$
    .map((data) => {
      return data.reduce((map, point) => {
        const char = utils.getChar(point);
        const name = utils.getURLSafeName(point.name);
        map.nameForChar[char] = name;
        map.charForName[name] = char;
        return map;
      }, {
        nameForChar: {},
        charForName: {}
      })
    });
}

export function configToPath(config, emojiToNameMap) {
  let components = [];

  components.push(emojiToNameMap.nameForChar[config.emoji]);

  if (config.imageSize !== INITIAL_CONFIG.imageSize) {
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

  if (!config.padding) {
    components.push("no-padding");
  }

  components.reverse();
  return "/" + components.join("/");
}

export function pathToEvents(path, emojiToNameMap) {
  const options = path.slice(1).split("/").reverse();
  const actions = [];
  actions.push({
    action: "set-emoji",
    emoji: "🌈"
  })

  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    let match;

    if (index === 0) {
      const emoji = emojiToNameMap.charForName[option];
      if (emoji) {
        actions.push({
          action: "set-emoji",
          emoji
        });
        continue;
      } else {
        console.log("warning, no emoji at first position");
      }
    }

    if (option === "no-padding") {
      actions.push({
        action: "set-padding",
        padding: false
      });
      continue;
    }

    match = option.match(/^is-(\d+)$/);
    if (match) {
      actions.push({
        action: "set-image-size",
        size: parseInt(match[1])
      });
      continue;
    }

    match = option.match(/^bg-([A-Za-z0-9]{6})$/);
    if (match) {
      actions.push({
        action: "set-background",
        background: `#${match[1]}`
      });
      continue;
    }

    console.log("Warning, ignoring unknown option", option);
  }

  return actions;
}
