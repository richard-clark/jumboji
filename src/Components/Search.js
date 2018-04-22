import React from "react";
import Icon from "./Icon.js";
import { connect } from "react-redux";
import DropdownContent from "./DropdownContent.js";

function EmptyStateButton({ children, onClick }) {
  return (
    <button className="search-results__empty-state-btn" onClick={onClick}>
      {children}
    </button>
  );
}

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
    <DropdownContent onClose={onClose}>
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
    </DropdownContent>
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
