import {h} from "snabbdom/h";
import * as most from "most";
import * as utils from "../utils.js";

function EmptyStateButton(emoji) {
  return h("button.search-results__empty-state-btn", {
    dataset: {trigger: "search-result", emoji}
  }, emoji);
}

function dom(results, {query}) {

  const resultElements = results.results.map((result) => {
    return h("button.search-results__result-btn", {
      key: result.name,
      dataset: {trigger: "search-result", emoji: result.emoji }
    }, result.emoji);
  });

  let moreIndicator = "";
  if (results.totalResults > 19) {
    moreIndicator = h("p.search-results__more-indicator",
      {},
      `+${(results.totalResults-19).toLocaleString()}`
    );
  }

  let emptyState = "";
  if (!results.hasData || results.totalResults === 0) {
    emptyState = EmptyStateButton("😞");
  }

  const closeButton = h("button.dropdown__close", {
    dataset: {trigger: "close-dropdown"}
  },
    h("i.material-icons", {}, "close")
  );

  const modal = h("div.dropdown__content", {}, [
    closeButton,
    h("div.dropdown-group.dropdown-group--no-padding", {}, [
      h("input.input.search-input", {
        props: {
          placeholder: `Search for something`,
          value: query
        }
      })
    ]),
    h("div.dropdown-group.search-results.dropdown-group--no-padding", {}, [
      ...resultElements,
      moreIndicator,
      emptyState
    ])
  ]);

  return modal;

}

export default function Search({dataMatchingSearch$, searchParams$}) {

  const dom$ = most.combine(dom, dataMatchingSearch$, searchParams$);

  return { dom$ }

}
