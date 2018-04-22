import store, { INITIAL_STATE } from "./store.js";
import createHistory from "history/createBrowserHistory";

const history = createHistory();

export function encodePath({
  emojiToNameMap,
  emoji,
  imageSize,
  background,
  variation,
  padding
}) {
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
    components.push(`bg-${background}`);
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

function updateStateFromPath(path) {
  const state = store.getState();
  const { emojiToNameMap } = state;

  const keys = ["emoji", "padding", "imageSize", "background", "variation"];
  const previousConfig = keys.reduce((acc, k) => {
    acc[k] = state[k];
    return acc;
  }, {});
  let config = {
    emoji: INITIAL_STATE.emoji,
    padding: INITIAL_STATE.padding,
    imageSize: INITIAL_STATE.imageSize,
    variation: INITIAL_STATE.variation,
    background: INITIAL_STATE.background
  };

  const options = path
    .slice(1)
    .split("/")
    .reverse();

  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    let match;

    if (index === 0) {
      const emoji = emojiToNameMap.charForName[option];
      if (emoji) {
        config.emoji = emoji;
        continue;
      }
    }

    if (option === "padding") {
      config.padding = true;
      continue;
    }

    match = option.match(/^is-(\d+)$/);
    if (match) {
      config.imageSize = parseInt(match[1]);
      continue;
    }

    match = option.match(/^bg-([A-Za-z0-9]{6})$/);
    if (match) {
      config.background = `#${match[1]}`;
      continue;
    }

    match = option.match(/^n-(\d{1,2})$/);
    if (match) {
      config.variation = parseInt(match[1]);
      continue;
    }
  }

  let changedKeys = keys.filter(k => config[k] !== previousConfig[k]);
  if (changedKeys.length > 0) {
    store.dispatch({
      type: "SET_CONFIG",
      data: config
    });
  }
}

store.subscribe(() => {
  const state = store.getState();

  if (!state.routerStateInitialized && state.emojiToNameMap) {
    history.listen(location => {
      updateStateFromPath(location.pathname);
    });
    updateStateFromPath(history.location.pathname);
    store.dispatch({
      type: "ROUTER_STATE_INITIALIZED"
    });
  }

  if (state.routerStateInitialized) {
    const path = encodePath(state);

    if (path && path !== history.location.pathname) {
      history.push(path, {});
    }
  }
});
