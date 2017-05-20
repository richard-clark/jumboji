import {h} from "snabbdom/h";
import * as most from "most";
import convert from "color-convert";

function IconButton(icon, data) {
  return h(`button.icon-btn`,
    {dataset: data},
    h("i.material-icons", {}, icon)
  );
}

function SimpleButton(text, dataset) {
  return h("button", {dataset}, text);
}

function colorToRGBString(color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function getNavStyle(palette) {
  // dominantColor
  const backgroundColor = palette[0];
  const bgColorInHSL = convert.rgb.hsl(backgroundColor);
  console.log(bgColorInHSL);
  let navClass = "main__nav--fg-light";
  if (bgColorInHSL[2] > 50) {
    navClass = "main__nav--fg-dark";
  }
  return {
    backgroundColor: colorToRGBString(backgroundColor),
    className: navClass
  };
}

function view(dataToRender$) {

  const dom$ = dataToRender$.map(({palette}) => {
    const navStyle = getNavStyle(palette);
    const style = `background-color:${navStyle.backgroundColor}`;

    const vnode = h(`nav.main__nav.${navStyle.className}`, {props: {style}}, [
      h("h3", {}, "Hello World!"),
      IconButton("refresh", {trigger: "randomize"}),
      SimpleButton("imageSize:small", {action: "set-image-size", size: 16}),
      SimpleButton("imageSize:medium", {action: "set-image-size", size: 32}),
      SimpleButton("imageSize:large", {action: "set-image-size", size: 64}),
      SimpleButton("tileSize:small", {action: "set-tile-size", size: 16}),
      SimpleButton("tileSize:medium", {action: "set-tile-size", size: 32}),
      SimpleButton("tileSize:large", {action: "set-tile-size", size: 64}),
    ]);

    return vnode
  });

  return {
    dom$
  }


}

export default function Nav({dataToRender$}) {

  return view(dataToRender$);

}
