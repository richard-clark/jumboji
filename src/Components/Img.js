import {h} from "snabbdom/h";
import * as most from "most";

function render(imageUrl, config) {

  let cls = ".main__content.img-container";
  if (config.fullSize) {
    cls += ".img-container--full-size";
  }

  let img = "";
  if (imageUrl) {
    img = h("img.img-container__img", {
      key: "img-inner",
      props: {
        src: imageUrl
      }
    });
  }

  let vnode = h(`div${cls}`,
    {dataset: {action: "toggle-full-size"}, key: "img"},
    img
  );

  return vnode;
}

export default function Img({imageBlob$, config$}) {

  const dom$ = most.combine(
    render,
    imageBlob$,
    config$
  );

  return { dom$ }

}
