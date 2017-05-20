import {h} from "snabbdom/h";
import * as most from "most";

function render(imageSrc, config) {

  let cls = ".main__content.img-container";
  if (config.fullSize) {
    cls += ".img-container--full-size";
  }

  let img = "";
  if (imageSrc) {
    img = h("img.img-container__img", {
      props: {
        src: imageSrc
      }
    });
  }

  let vnode = h(`div${cls}`,
    {dataset: {action: "toggle-full-size"}},
    img
  );

  return vnode;
}

export default function Img({image$, config$}) {

  const dom$ = most.combine(
    render,
    image$,
    config$
  );

  return { dom$ }

}
