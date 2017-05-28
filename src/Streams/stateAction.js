import * as configUtils from "../configUtils.js";
import * as utils from "../utils.js";
import * as most from "most";
import Observable from "zen-observable";

function pathToEvents(path, emojiToNameMap) {
  const options = path.slice(2).split("/").reverse();
  const actions = [
    { action: "set-emoji", emoji: configUtils.INITIAL_CONFIG.emoji },
    { action: "set-image-size", size: `${configUtils.INITIAL_CONFIG.imageSize}` },
    { action: "set-variation", variation: `${configUtils.INITIAL_CONFIG.variation}` },
    { action: "set-padding", padding: `${configUtils.INITIAL_CONFIG.padding}` },
    { action: "set-background", background: configUtils.INITIAL_CONFIG.background }
  ];

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
        padding: "true"
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
      const variation = parseInt(match[1]);
      actions.push({
        action: "set-variation",
        variation
      });
      continue;
    }
  }

  actions.push({ action: "parsed-route-from-config" });

  return actions;
}

function getHistoryObservable(history) {
  return new Observable((observer) => {
    const unlisten = history.listen((location) => {
      observer.next(location);
    });
    observer.next(history.location);
    return () => unlisten();
  });
}

export default function StateAction$({history, emojiToNameMap$, data$}) {

  const stateAction$ = most.combine(
    (location, emojiToNameMap) => ({location, emojiToNameMap}),
    most.from(getHistoryObservable(history)),
    emojiToNameMap$
  )
  .concatMap(({location, emojiToNameMap}) =>
    most.from(pathToEvents(location.hash, emojiToNameMap))
  )
  .multicast();

  return stateAction$;

}
