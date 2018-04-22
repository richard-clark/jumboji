import React from "react";
import Icon from "./Icon.js";
import { connect } from "react-redux";

function EmptyStateButton({ emoji, onClick }) {
  return (
    <button className="search-results__empty-state-btn" onClick={onClick}>
      {emoji}
    </button>
  );
}

// function EmptyStateButton(emoji) {
//   return h("button.search-results__empty-state-btn", {
//     dataset: {trigger: "search-result", emoji}
//   }, emoji);
// }

function Search({ results, query, onEmojiSelected, onClose, onQueryUpdated }) {
  const resultElements = results.results.map(result => {
    return (
      <button
        className="search-results__result-btn"
        key={result.name}
        onClick={() => onEmojiSelected(result.emoji)}
      >
        {result.emoji}
      </button>
    );
  });

  let moreIndicator;
  if (results.totalResults > 19) {
    moreIndicator = (
      <p className="search-results__more-indicator">
        {/* TODO: add thousands separators: */}
        +{results.totalResults - 19}
      </p>
    );
  }

  let emptyState;
  if (!results.hasData || results.totalResults === 0) {
    emptyState = (
      <EmptyStateButton onClick={() => onQueryUpdated("")}>😞</EmptyStateButton>
    );
  }

  return (
    <div className="dropdown__content">
      <button className="dropdown__close" onClick={onClose}>
        <Icon type="close" />
      </button>
      <div className="dropdown-group dropdown-group--no-padding">
        <input
          className="input search-input"
          placeholder="Search for something"
          value={query}
          onChange={e => onQueryUpdated(e.target.value)}
        />
      </div>
      <div className="dropdown-group search-results dropdown-group--no-padding">
        {resultElements}
        {moreIndicator}
        {emptyState}
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    results: state.searchResults,
    query: state.searchQuery
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onClose() {
      dispatch({ type: "CLOSE_DROPDOWN" });
    },
    onEmojiSelected(emoji) {
      dispatch({
        type: "SET_EMOJI",
        data: { emoji }
      });
      dispatch({ type: "CLOSE_DROPDOWN" });
    },
    onQueryUpdated(query) {
      dispatch({ type: "UPDATE_SEARCH_QUERY", data: { query } });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Search);

// function dom(results, { query }) {
//   // const resultElements = results.results.map((result) => {
//   //   return h("button.search-results__result-btn", {
//   //     key: result.name,
//   //     dataset: {trigger: "search-result", emoji: result.emoji }
//   //   }, result.emoji);
//   // });
//   // let moreIndicator = "";
//   // if (results.totalResults > 19) {
//   //   moreIndicator = h("p.search-results__more-indicator",
//   //     {},
//   //     `+${(results.totalResults-19).toLocaleString()}`
//   //   );
//   // }
//   // let emptyState = "";
//   // if (!results.hasData || results.totalResults === 0) {
//   //   emptyState = EmptyStateButton("😞");
//   // }
//   // const closeButton = h("button.dropdown__close", {
//   //   dataset: {trigger: "close-dropdown"}
//   // },
//   //   h("i.material-icons", {}, "close")
//   // );
//   //
//   // const modal = h("div.dropdown__content", {}, [
//   //   closeButton,
//   //   h("div.dropdown-group.dropdown-group--no-padding", {}, [
//   //     h("input.input.search-input", {
//   //       props: {
//   //         placeholder: `Search for something`,
//   //         value: query
//   //       }
//   //     })
//   //   ]),
//   //   h("div.dropdown-group.search-results.dropdown-group--no-padding", {}, [
//   //     ...resultElements,
//   //     moreIndicator,
//   //     emptyState
//   //   ])
//   // ]);
//   //
//   // return modal;
// }

// export default function Search({
//   dataMatchingSearch$,
//   searchParams$,
//   visibleDropdown$
// }) {
//   const dom$ = most.combine(dom, dataMatchingSearch$, searchParams$);
//
//   visibleDropdown$
//     .map(visible => visible === "search")
//     .skipRepeats()
//     .filter(isVisible => true)
//     .delay(100)
//     .observe(() => document.querySelector(".search-input").select());
//
//   return { dom$ };
// }
