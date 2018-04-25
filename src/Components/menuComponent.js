import React, {PureComponent} from "react";
import { connect } from "react-redux";

function mapStateToProps(state) {
  return {
    imageSize: state.imageSize,
    background: state.background,
    padding: state.padding,
    variation: state.variation
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetPadding(padding) {
      dispatch({
        type: "SET_PADDING",
        data: { padding }
      });
    },
    onSetImageSize(imageSize) {
      dispatch({
        type: "SET_IMAGE_SIZE",
        data: { imageSize }
      });
    },
    onSetBackground(background) {
      dispatch({
        type: "SET_BACKGROUND",
        data: { background }
      });
    },
    onSetVariation(variation) {
      dispatch({
        type: "SET_VARIATION",
        data: { variation }
      });
    }
  };
}

export default function menuComponent(WrappedComponent, config) {
  const cls = class extends PureComponent {
    render() {
      return (
        <WrappedComponent {...this.props} config={config} />
      );
    }
  }
  return connect(mapStateToProps, mapDispatchToProps)(cls);
}
