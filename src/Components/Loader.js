import {h} from "snabbdom/h";
import * as most from "most";

export default function Loader({loading$}) {

  const dom$ = loading$.map((loading) => {
    if (!loading) { return ""; }

    const elements = Array(9).fill(0).map((_, index) => index + 1)
      .map((index) => h(`div.cube-loader__cube.cube-loader__cube--${index}`, {key: `loader-${index}`}));

    return h("div.main__loader.main__loader--loading", {key: "loader"},
      h("div.cube-loader", {},
        elements
      )
    );
  });

  return { dom$ }

}
