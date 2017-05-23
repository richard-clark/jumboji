import * as most from "most";
import * as utils from "../utils.js";

function search(data, searchParams) {
  const query = searchParams.query.trim().toLowerCase();
  let results = data;

  if (query.length > 0) {
    results = data.filter((point) => {
      return query === utils.getChar(point) ||
        point.name.toLowerCase().indexOf(query) >= 0 ||
        point.keywords.some((keyword) => keyword.indexOf(query) >= 0);
    })
  }

  return {
    hasData: data.length > 0,
    results: results.slice(0, 29).map((point) => ({
      name: point.name,
      emoji: utils.getChar(point)
    })),
    totalResults: results.length
  };
}

export function DataMatchingSearch$({data$, searchParams$}) {
  return most.combine(search, data$, searchParams$);
}

export function SearchAction$({clickWithDataTarget$}) {
  return clickWithDataTarget$
    .filter(({trigger}) => trigger === "search-result")
    .multicast();
}

export function SearchParams$({clickWithDataTarget$, searchAction$}) {

  const searchInput$ = most.fromEvent("input", document)
    .tap((event) => console.log(event.target))
    .filter((event) => event.target.classList.contains("search-input"))
    .map((event) => event.target.value)
    .map((query) => ({query}));

  const searchOpen$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "show-serch-modal")
    .map(() => ({show: true, query: ""}));

  const escButton$ = most.fromEvent("keyup", document)
    .filter((event) => event.keyCode === 27);

  const searchClose$ = most.merge(searchAction$, escButton$)
    .map(() => ({show: false}));

  const INITIAL_SEARCH_PARAMS = {
    show: false,
    query: ""
  };

  return most.merge(searchInput$, searchClose$, searchOpen$)
    .scan((params, delta) => ({...params, ...delta}), INITIAL_SEARCH_PARAMS)
    .startWith(INITIAL_SEARCH_PARAMS)
    .tap((params) => console.log("params", params))
    .multicast();

}
