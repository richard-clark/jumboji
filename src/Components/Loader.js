import {h} from "snabbdom/h";
import * as most from "most";

export default function Loader({loading$}) {

  const dom$ = loading$.map((loading) => {
    if (!loading) { return ""; }

    const elements = Array(9).fill(0).map((_, index) => index + 1)
      .map((index) => h(`div.sk-cube.sk-cube${index}`, {}));

    return h("div.main__loader.main__loader--loading", {},
      h("div.sk-cube-grid", {},
        elements
      )
    );
  });

  return { dom$ }

}
