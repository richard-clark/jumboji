import React from "react";
import {connect} from "react-redux";

function Loader({ loading }) {
  if (!loading) {
    return null;
  }

  const children = Array(9)
    .fill(0)
    .map((_, index) => index + 1)
    .map(index => {
      return (
        <div
          className={`cube-loader__cube cube-loader__cube--${index}`}
          key={index}
        />
      );
    });

  return (
    <div className="main__loader main__loader--loading">
      <div className="cube-loader">{children}</div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    loading: state.initialLoading || state.workerLoading
  };
}

export default connect(mapStateToProps)(Loader);
