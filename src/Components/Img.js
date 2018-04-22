import React, { PureComponent } from "react";
import classNames from "classnames";
import { connect } from "react-redux";

import * as utils from "../utils.js";
import * as effects from "redux-saga/effects";

function render({
  imageData,
  appearanceData,
  tileSize,
  imageSize,
  padding,
  background
}) {
  const { metrics } = appearanceData;

  let paddingAmount = padding ? tileSize * 0.2 : 0;
  let width = tileSize * imageSize + (imageSize - 1) * paddingAmount;
  let height = tileSize * imageSize + (imageSize - 1) * paddingAmount;
  const TILE_SIZE = tileSize;

  const emojiCanvas = utils.createCanvas(width, height);
  document.body.appendChild(emojiCanvas);
  const context = emojiCanvas.getContext("2d");
  const fontSize =
    Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;
  context.font = `${fontSize}px sans-serif`;

  if (background) {
    context.save();
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  for (let { x, y, item } of imageData) {
    context.fillText(
      item.char,
      x * TILE_SIZE + x * paddingAmount - TILE_SIZE * metrics.xOffset,
      y * TILE_SIZE +
        TILE_SIZE +
        y * paddingAmount -
        TILE_SIZE * metrics.yOffset
    );
  }

  const image = emojiCanvas.toDataURL("image/png");
  emojiCanvas.remove();

  return image;
}

function imagesAreEqual(a, b) {
  const areEqual =
    a.imageData === b.imageData &&
    (a.appearanceData ? a.appearanceData.metrics : null) ===
      (b.appearanceData ? b.appearanceData.metrics : null) &&
    a.tileSize === b.tileSize &&
    a.imageSize === b.imageSize &&
    a.padding === b.padding &&
    a.background === b.background &&
    a.variation === b.variation;
  return areEqual;
}

function imageToBlob(image) {
  if (!image) {
    return;
  }

  // http://stackoverflow.com/a/16245768
  const splitIndex = image.indexOf(",");
  const imageData = atob(image.slice(splitIndex + 1));
  let binaryData = new Array(imageData.length);
  for (let i = 0; i < binaryData.length; i++) {
    binaryData[i] = imageData.charCodeAt(i);
  }
  const byteArray = new Uint8Array(binaryData);
  // http://stackoverflow.com/a/23956661
  const blob = new Blob([byteArray], { type: "image/png" });

  return URL.createObjectURL(blob);
}

// export default function* renderImage() {
//   let previousState = {};
//
//   while (true) {
//     yield effects.take("*");
//     const state = yield effects.select(s => ({
//       emoji: s.emoji,
//       appearanceData: s.appearanceData,
//       imageSize: s.imageSize,
//       variation: s.variation,
//       imageData: s.imageData,
//       background: s.background,
//       padding: s.padding,
//       tileSize: s.tileSize
//     }));
//     if (
//       state.appearanceData &&
//       state.imageData &&
//       !imagesAreEqual(previousState, state)
//     ) {
//       const image = render(state);
//       const imageUrl = imageToBlob(image);
//       yield effects.put({ type: "UPDATE_IMAGE", data: { imageUrl } });
//       previousState = state;
//     }
//   }
// }

class Img extends PureComponent {
  constructor(props) {
    super(props);
    this.element = null;
    this.canvas = null;
    this.initiallyRendered = false;
    this.setElement = element => {
      if (element && element !== this.element) {
        this.element = element;
        const canvas = document.createElement("canvas");
        canvas.className = "img-container__img";
        this.element.innerHTML = "";
        this.element.appendChild(canvas);
        this.canvas = canvas;
        if (this.props.apperanceData && this.props.imageData) {
          this.renderImage();
        }
      }
    };
    this.version = 1;
    this.index = 0;
  }
  renderEmoji(version) {
    window.requestAnimationFrame(() => {
      if (version === this.version) {
        const {
          imageData,
          appearanceData,
          tileSize,
          imageSize,
          padding,
          background
        } = this.props;
        const { metrics } = appearanceData;

        let paddingAmount = padding ? tileSize * 0.2 : 0;
        const TILE_SIZE = tileSize;

        let startIndex = this.index;
        let endIndex = Math.min(this.index + 100, imageData.length);

        const context = this.canvas.getContext("2d");

        for (let i = startIndex; i < endIndex; i++) {
          const { x, y, item } = imageData[i];
          context.fillText(
            item.char,
            x * TILE_SIZE + x * paddingAmount - TILE_SIZE * metrics.xOffset,
            y * TILE_SIZE +
              TILE_SIZE +
              y * paddingAmount -
              TILE_SIZE * metrics.yOffset
          );
        }
        if (endIndex < imageData.length) {
          this.index = endIndex;
          this.renderEmoji(version);
        }
      }
    });
  }
  renderImage() {
    const {
      imageData,
      appearanceData,
      tileSize,
      imageSize,
      padding,
      background
    } = this.props;
    const { metrics } = appearanceData;

    let paddingAmount = padding ? tileSize * 0.2 : 0;
    let width = tileSize * imageSize + (imageSize - 1) * paddingAmount;
    let height = tileSize * imageSize + (imageSize - 1) * paddingAmount;
    const TILE_SIZE = tileSize;

    const bounds = this.element.getBoundingClientRect();

    this.canvas.width = width;
    this.canvas.height = height;
    // this.canvas.style.width = `${width / 2}px`;
    // this.canvas.style.height = `${height / 2}px`;
    this.canvas.style.width = (bounds.height - 20) + "px";
    this.canvas.style.height = (bounds.height - 20) + "px";

    const fontSize =
      Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;

    const context = this.canvas.getContext("2d");
    context.font = `${fontSize}px sans-serif`;

    if (background) {
      context.save();
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.restore();
    }

    this.renderEmoji(this.version);
  }
  componentDidUpdate(lastProps) {
    if (
      this.props.appearanceData &&
      this.props.imageData &&
      !imagesAreEqual(lastProps, this.props)
    ) {
      this.version++;
      this.index = 0;
      if (this.canvas) {
        this.renderImage();
      }
    }
  }
  render() {
    return (
      <div className="main__content img-container" ref={this.setElement}>
        {/* <div  /> */}
      </div>
    );
  }
}

// // TODO: set .main__content
// // TODO: onClick: toggle full size
// function Img({ imageUrl, fullSize, onClick }) {
//   const imgClasses = classNames("main__content", "img-container", {
//     "img-container--full-size": fullSize
//   });
//
//   let img;
//   if (imageUrl) {
//     img = <img className="img-container__img" src={imageUrl} />;
//   }
//
//   return (
//     <div className={imgClasses} onClick={onClick}>
//       {img}
//     </div>
//   );
// }

function mapStateToProps(s) {
  return {
    emoji: s.emoji,
    appearanceData: s.appearanceData,
    imageSize: s.imageSize,
    variation: s.variation,
    imageData: s.imageData,
    background: s.background,
    padding: s.padding,
    tileSize: s.tileSize
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onClick() {
      dispatch({ type: "TOGGLE_FULL_SIZE" });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Img);

// function render(imageUrl, config) {
//
//   let cls = ".main__content.img-container";
//   if (config.fullSize) {
//     cls += ".img-container--full-size";
//   }
//
//   let img = "";
//   if (imageUrl) {
//     img = h("img.img-container__img", {
//       key: "img-inner",
//       props: {
//         src: imageUrl
//       }
//     });
//   }
//
//   let vnode = h(`div${cls}`,
//     {dataset: {action: "toggle-full-size"}, key: "img"},
//     img
//   );
//
//   return vnode;
// }
//
//
//
// export default function Img({imageBlob$, config$}) {
//
//   const dom$ = most.combine(
//     render,
//     imageBlob$,
//     config$
//   );
//
//   return { dom$ }
//
// }
