import {h} from "snabbdom/h";
import * as most from "most";
import * as utils from "../utils.js";

function getRandomEmoji(possibleEmoji) {
  return possibleEmoji[utils.rand(possibleEmoji.length)];
}

function EmptyStateButton(possibleEmoji) {
  const emoji = getRandomEmoji(possibleEmoji);

  return h("button.search-results__empty-state-btn", {
    dataset: {trigger: "search-result", emoji}
  }, emoji);
}

const ALL_THE_DETECTIVES = ["🕵🏽‍♀️", "🕵🏿‍♂️", "🕵🏼‍♀️", "🕵🏻‍♂️", "🕵🏾‍♀️", "🕵🏿‍♀️", "🕵🏽‍♂️", "🕵🏾‍♂️", "🕵🏻‍♀️", "🕵🏼‍♂️"];
const ALL_PEOPLE_SHRUGGING = ["🤷🏾‍♂️", "🤷🏻‍♀️", "🤷🏼‍♀️", "🤷🏾‍♀️", "🤷🏽‍♂️", "🤷🏿‍♂️", "🤷🏽‍♀️", "🤷🏻‍♂️", "🤷🏼‍♂️"];

function dom(results, {show, query}) {

  const resultElements = results.results.map((result) => {
    return h("button.search-results__result-btn", {
      key: result.name,
      dataset: {trigger: "search-result", emoji: result.emoji }
    }, result.emoji);
  });

  let moreIndicator = "";
  if (results.totalResults > 29) {
    moreIndicator = h("p.search-results__more-indicator",
      {},
      `+${(results.totalResults-29).toLocaleString()}`
    );
  }

  let emptyState = "";
  if (!results.hasData) {
    emptyState = EmptyStateButton(ALL_THE_DETECTIVES);
  } else if (results.totalResults === 0) {
    emptyState = EmptyStateButton(ALL_PEOPLE_SHRUGGING);
  }

  const modal = h("div.modal-container__modal", {}, [
    h("input.input--outlined.input--large.input.search-input", {
      props: {
        placeholder: `Search for something ${getRandomEmoji(ALL_THE_DETECTIVES)}`,
        value: query
      }
    }),
    h("div.search-results", {}, [
      ...resultElements,
      moreIndicator,
      emptyState
    ])
  ]);

  return h("div.modal-container", {
    class: {
      "modal-container--visible": show
    }
  }, [
    h("div.modal-container__overlay", {}),
    modal
  ]);

}

export default function Search({dataMatchingSearch$, searchParams$}) {

  const dom$ = most.combine(dom, dataMatchingSearch$, searchParams$);

  return { dom$ }

}