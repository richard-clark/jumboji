import * as most from "most";
import * as utils from "../utils.js";

function search(data, searchParams) {
  const query = searchParams.query.trim().toLowerCase();
  let results = data;

  if (query.length > 0) {
    results = data.filter((point) => {
      return query === point.char ||
        point.name.toLowerCase().indexOf(query) >= 0 ||
        point.keywords.some((keyword) => keyword.indexOf(query) >= 0);
    })
  }

  return {
    hasData: data.length > 0,
    results: results.slice(0, 19).map((point) => ({
      name: point.name,
      emoji: point.char
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
    .filter((event) => event.target.classList.contains("search-input"))
    .map((event) => event.target.value)
    .map((query) => ({query}));

  const INITIAL_SEARCH_PARAMS = {
    show: false,
    query: ""
  };

  return searchInput$
    .startWith(INITIAL_SEARCH_PARAMS)
    .multicast();

}
