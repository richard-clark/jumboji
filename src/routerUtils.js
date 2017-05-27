import * as configStream from "./Streams/config.js";
import * as utils from "./utils.js";
import createHistory from "history/createBrowserHistory";
import * as most from "most";
import Observable from "zen-observable";

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
    }).multicast();
}

export function configToPath(config, emojiToNameMap) {
  let components = [];

  components.push(emojiToNameMap.nameForChar[config.emoji]);

  if (config.imageSize !== configStream.INITIAL_CONFIG.imageSize) {
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

  if (config.sampleNeighbors !== configStream.INITIAL_CONFIG.sampleNeighbors) {
    components.push(`n-${config.sampleNeighbors}`);
  }

  if (config.padding) {
    components.push("padding");
  }

  components.reverse();
  return "/" + components.join("/");
}

export function pathToEvents(path, emojiToNameMap) {
  const options = path.slice(2).split("/").reverse();
  const actions = [];

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

    if (option === "padding") {
      actions.push({
        action: "set-padding",
        padding: true
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

    match = option.match(/^n-(\d{1,2})$/);
    if (match) {
      const neighbors = parseInt(match[1]);
      actions.push({
        action: "set-neighbors",
        sampleNeighbors: neighbors
      });
      continue;
    }

    console.log("Warning, ignoring unknown option", option);
  }

  return actions;
}

function getHistoryObservable(history) {
  return new Observable((observer) => {
    const unlisten = history.listen((location) => {
      observer.next(location);
    });
    return () => unlisten();
  });
}

function getInitialState(history, emojiToNameMap) {
  const path = history.location.hash;
  const actions = pathToEvents(path, emojiToNameMap);
  return actions.reduce(configStream.actionReducer, configStream.INITIAL_CONFIG);
}

export function makeInterface({data$}) {

  const history = createHistory();

  const emojiToNameMap$ = EmojiToNameMap$({data$});

  const initialConfig$ = emojiToNameMap$
    .map((emojiToNameMap) => getInitialState(history, emojiToNameMap))
    .multicast();

  const stateAction$ = most.combine(
    (location, emojiToNameMap) => ({location, emojiToNameMap}),
    most.from(getHistoryObservable(history)),
    emojiToNameMap$
  )
  .concatMap(({location, emojiToNameMap}) =>
    most.from(pathToEvents(location.hash, emojiToNameMap))
  )
  .multicast();

  function observe(config$) {
    most.combine(
      (config, emojiToNameMap) => ({config, emojiToNameMap}),
      config$,
      emojiToNameMap$
    )
    .observe(({config, emojiToNameMap}) => {
      if (!config.emoji) {
        return;
      }
      const path = "#" + configToPath(config, emojiToNameMap);
      if (path === history.location.hash) {
        return;
      }
      history.push(path, {});
    });

  }

  return {
    observe,
    stateAction$,
    initialConfig$
  };

}
