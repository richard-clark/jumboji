import React, { PureComponent } from "react";
import { connect } from "react-redux";
import Icon from "./Icon.js";

function EmptyStateButton({ children, onClick }) {
  return (
    <button className="search-results__empty-state-btn" onClick={onClick}>
      {children}
    </button>
  );
}

function toStringWithSeparators(val) {
  let str = val.toString();
  if (val >= 0 && Math.abs(val) === val) {
    for (let i = str.length - 3; i > 0; i -= 3) {
      str = str.substr(0, i) + "," + str.substr(i);
    }
  }
  return str;
}

class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.input = null;
    this.setInput = element => {
      if (element && element !== this.element) {
        this.element = element;
        this.element.focus();
      }
    };
  }
  render() {
    const { results, query, onEmojiSelected, onQueryUpdated } = this.props;

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
          +{toStringWithSeparators(results.totalResults - 19)}
        </p>
      );
    }

    let emptyState;
    if (!results.hasData || results.totalResults === 0) {
      emptyState = (
        <EmptyStateButton onClick={() => onQueryUpdated("")}>
          😞
        </EmptyStateButton>
      );
    }

    return (
      <div>
        <div className="dropdown-group dropdown-group--no-padding">
          <input
            className="input search-input"
            placeholder="Search for something"
            value={query}
            onChange={e => onQueryUpdated(e.target.value)}
            ref={this.setInput}
          />
        </div>
        <div className="dropdown-group search-results dropdown-group--no-padding">
          {resultElements}
          {moreIndicator}
          {emptyState}
        </div>
        <p className="dropdown__info">
          Jumboji uses the emoji that are available on your system, so results
          will vary from device to device.
        </p>
      </div>
    );
  }
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
