import * as configUtils from "../configUtils.js";
import * as most from "most";

export default function Config$({
  data$,
  clickWithDataTarget$,
  stateAction$,
  searchAction$
}) {

  const clickAction$ = clickWithDataTarget$
    .filter(({action}) => action);

  const randomizeAction$ = most.combine(
    configUtils.getRandomEmoji,
    data$,
    clickWithDataTarget$
      .filter(({trigger}) => trigger === "randomize")
  ).multicast();

  const _searchAction$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "search-result")
    .filter((action) => action.emoji)
    .map((action) => ({action: "set-emoji", emoji: action.emoji}));

  const config$ = most.merge(stateAction$, clickAction$, _searchAction$, randomizeAction$)
    .scan(configUtils.actionReducer, configUtils.INITIAL_CONFIG)
    .skipRepeatsWith(configUtils.objectsAreEqual)
    .debounce(200)
    .startWith({})
    .multicast();

  return config$;

}
