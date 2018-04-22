import React, { PureComponent } from "react";
import classNames from "classnames";
import { connect } from "react-redux";

function imagesAreEqual(a, b) {
  const areEqual =
    a.imageData === b.imageData &&
    (a.appearanceData ? a.appearanceData.metrics : null) ===
      (b.appearanceData ? b.appearanceData.metrics : null) &&
    a.tileSize === b.tileSize &&
    a.padding === b.padding &&
    a.background === b.background;
  return areEqual;
}

function imageToDataURL(image) {
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

class Img extends PureComponent {
  constructor(props) {
    super(props);
    this.element = null;
    this.canvas = null;
    this.image = null;
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
        this.image = document.createElement("img");
        this.image.className = "img-container__img";
        this.element.appendChild(this.image);
      }
    };
    this.version = 1;
    this.index = 0;
    this.state = {
      renderProgress: 0,
      fullSize: true
    };
    this.onResize = () => {
      window.requestAnimationFrame(() => {
        if (this.element && !this.state.fullSize) {
          const bounds = this.element.getBoundingClientRect();
          const boundingSize = Math.min(bounds.width, bounds.height);
          this.image.style.width = boundingSize + "px";
          this.image.style.height = boundingSize + "px";
          this.canvas.style.width = boundingSize + "px";
          this.canvas.style.height = boundingSize + "px";
        }
      });
    };
  }
  componentDidMount() {
    window.addEventListener("resize", this.onResize);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }
  renderCanvasImage(version) {
    window.requestIdleCallback(() => {
      if (version === this.version) {
        this.canvas.style.display = "none";

        // Image will be invalid (show broken icon) if canvas width/height are
        // zero, so just keep image hidden in this case.
        if (this.canvas.width > 0 && this.canvas.height > 0) {
          const image = this.canvas.toDataURL("image/png");
          this.image.src = image;
          this.image.style.display = null;

          const blob = imageToDataURL(image);
          this.props.onRenderComplete(blob);
        }

        this.setState({ renderProgress: 1 });
      }
    });
  }
  renderEmoji(version) {
    window.requestIdleCallback(() => {
      if (version === this.version) {
        const { imageData, appearanceData, tileSize, padding } = this.props;
        const { metrics } = appearanceData;

        let paddingAmount = padding ? tileSize * 0.2 : 0;
        const TILE_SIZE = tileSize;

        let startIndex = this.index;
        this.setState({ renderProgress: startIndex / imageData.length });
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
        } else {
          this.renderCanvasImage(version);
        }
      }
    });
  }
  renderImage() {
    const {
      appearanceData,
      tileSize,
      padding,
      background,
      imageData
    } = this.props;
    const { metrics } = appearanceData;
    const { fullSize } = this.state;

    this.canvas.style.display = null;
    this.image.style.display = "none";
    this.setState({ renderProgress: 0 });
    this.props.onRenderStarted();

    const imageSize = Math.sqrt(imageData.length);
    let paddingAmount = padding ? tileSize * 0.2 : 0;
    let totalImageSize = tileSize * imageSize + (imageSize - 1) * paddingAmount;
    const TILE_SIZE = tileSize;

    let size;
    if (fullSize) {
      size = totalImageSize;
    } else {
      const bounds = this.element.getBoundingClientRect();
      size = Math.min(bounds.width, bounds.height);
    }

    this.canvas.width = totalImageSize;
    this.canvas.height = totalImageSize;

    this.image.style.width = size + "px";
    this.image.style.height = size + "px";
    this.canvas.style.width = size + "px";
    this.canvas.style.height = size + "px";

    const fontSize =
      Math.round(TILE_SIZE / metrics.actualHeightRatio * 100) / 100;

    const context = this.canvas.getContext("2d");
    context.font = `${fontSize}px sans-serif`;

    if (background) {
      context.save();
      context.fillStyle = background;
      context.fillRect(0, 0, totalImageSize, totalImageSize);
      context.restore();
    }

    this.renderEmoji(this.version);
  }
  componentDidUpdate(lastProps, lastState) {
    if (this.props.appearanceData && !imagesAreEqual(lastProps, this.props)) {
      this.version++;
      this.index = 0;
      if (this.canvas) {
        this.renderImage();
      }
    }
    if (lastState.fullSize !== this.state.fullSize) {
      // TODO: update size
      let size;
      if (this.state.fullSize) {
        size = null;
      } else {
        const bounds = this.element.parentElement.getBoundingClientRect();
        const boundingSize = Math.min(bounds.width, bounds.height);
        size = `${boundingSize}px`;
      }

      this.image.style.width = size;
      this.image.style.height = size;
      this.canvas.style.width = size;
      this.canvas.style.height = size;
    }
  }
  render() {
    let progressIndicator;
    const { renderProgress, fullSize } = this.state;
    const { workerProgress } = this.props;

    let progress;
    if (workerProgress < 1) {
      progress = workerProgress * 0.2;
    } else if (renderProgress < 1) {
      progress = 0.2 + renderProgress * 0.8;
    }

    let containerClasses = classNames("img-container", {
      "img-container--loading": progress > 0 && progress < 1,
      "img-container--full-size": fullSize
    });

    if (progress > 0 && progress < 1) {
      const style = {
        width: `${progress * 100}%`
      };
      progressIndicator = (
        <div className="render-progress">
          <div className="render-progress__indicator" style={style} />
        </div>
      );
    }

    return (
      <div
        className="main__content"
        onClick={() => this.setState({ fullSize: !fullSize })}
      >
        <div className={containerClasses}>
          <div className="img-container__inner" ref={this.setElement} />
        </div>
        {progressIndicator}
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
    variation: s.variation,
    imageData: s.imageData,
    background: s.background,
    padding: s.padding,
    tileSize: s.tileSize,
    workerProgress: s.workerProgress
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onClick() {
      dispatch({ type: "TOGGLE_FULL_SIZE" });
    },
    onRenderComplete(downloadUrl) {
      dispatch({
        type: "RENDER_COMPLETE",
        data: {
          downloadUrl
        }
      });
    },
    onRenderStarted() {
      dispatch({ type: "RENDER_STARTED" });
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
