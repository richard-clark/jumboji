import {h} from "snabbdom/h";
import * as most from "most";
import convert from "color-convert";

function IconButton(icon, data, selected) {
  return h(`button.nav__btn.icon-btn${selected ? '.icon-btn--selected' : ''}`,
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
  let navClass = "nav--fg-light";
  if (bgColorInHSL[2] > 50) {
    navClass = "nav--fg-dark";
  }
  const inputBGColor = backgroundColor.map((component) =>
    Math.round(255*0.8 + component*0.2)
  );
  return {
    backgroundColor: colorToRGBString(backgroundColor),
    className: navClass,
    inputBackgroundColor: colorToRGBString(inputBGColor)
  };
}

function view({palette}, config, initialLoading, image) {

  const navStyle = getNavStyle(palette);
  const style = `background-color:${navStyle.backgroundColor}`;

  const loadingClass = initialLoading ? "" : ".nav--visible";
  console.log("loading", loadingClass);

  let downloadButtonProps = {style: "cursor:not-allowed"};
  if (image) {
    downloadButtonProps = {
      download: "emoji.png",
      href: image,
      style: ""
    };
  }

  const vnode = h(`nav.main__nav.nav.${navStyle.className}${loadingClass}`,
    {props: {style}, key: "nav", hook: {
      init(n){console.log("init",n)},
      postpatch(n){console.log("postpatch")},
      destroy(n){console.log("destroy")},
      // remove(n){console.log("remove")}
      // update(old,n){console.log("update",JSON.stringify(old),n)}
    }}, [
      h("div.nav__inner", {key: "nav-inner"}, [
        h("div.nav__group", {}, [
          h("input.nav__input", {
            props: {
              style: `background-color:${navStyle.inputBackgroundColor}`,
              value: config.emoji
            }
          }),
          IconButton("check", {trigger: "emoji-input-submit"})
        ]),
        IconButton("refresh", {trigger: "randomize"}),
        IconButton("search", {trigger: "show-serch-modal"}),
        h("div.nav__group", {}, [
          IconButton("photo_size_select_small", {action: "set-image-size", size: 24}, config.imageSize===24),
          IconButton("photo_size_select_large", {action: "set-image-size", size: 32}, config.imageSize===32),
          IconButton("photo_size_select_actual", {action: "set-image-size", size: 64}, config.imageSize===64)
        ]),
        // SimpleButton("tileSize:small", {action: "set-tile-size", size: 16}),
        // SimpleButton("tileSize:medium", {action: "set-tile-size", size: 32}),
        // SimpleButton("tileSize:large", {action: "set-tile-size", size: 64}),
        h("div.nav__group", {}, [
          IconButton("panorama_fish_eye", {action: "set-background", background: null}, !config.background),
          IconButton("lens", {action: "set-background", background: "#ffffff"}, config.background === "#ffffff"),
        ]),
        h("div.nav__group", {}, [
          IconButton("grid_off", {action: "set-padding", padding: false}, !config.padding),
          IconButton("grid_on", {action: "set-padding", padding: true}, config.padding),
        ]),
        h(`a.nav__btn.icon-btn`,
          {props: downloadButtonProps},
          h("i.material-icons", {}, "file_download")
        )
      ])
    ]);

  return vnode;

}

export default function Nav({dataToRender$, config$, initialLoading$, image$}) {

  const dom$ = most.combine(view, dataToRender$, config$, initialLoading$, image$);

  return {dom$};

}
