import {h} from "snabbdom/h";
import * as most from "most";
import convert from "color-convert";

function TooltipContainer({tooltip, tooltipAlignRight, trigger}) {

  trigger.data.class["tooltip-container__trigger"] = true;

  return h(`div.tooltip-container`, {}, [
    trigger,
    h("div", {
      class: {
        "tooltip-container__tooltip": true,
        "tooltip-container__tooltip--align-right": tooltipAlignRight
      }
    }, tooltip)
  ]);

}


function IconButton(config) {

  const {icon, sel, cls, selected, data, props, tooltip} = config;

  const BASE_CLASS = {
    nav__btn: true,
    "icon-btn": true,
    "icon-btn--selected": selected || false
  };

  const vnode = {
    sel: sel || "button",
    data: {
      class: {...BASE_CLASS, ...(cls || {})},
      props: props || {},
      dataset: data
    },
    children: [
      h("i.material-icons", {}, icon)
    ]
  }

  if (tooltip) {
    return TooltipContainer({...config, trigger: vnode});
  } else {
    return vnode;
  }

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
          IconButton({
            icon: "check",
            data: {trigger: "emoji-input-submit"},
            tooltip: "Submit",
            tooltipAlignRight: true
          })
        ]),
        IconButton({
          icon: "refresh",
          data: {trigger: "randomize"},
          tooltip: "Random emoji 🍀",
          tooltipAlignRight: true
        }),
        IconButton({
          icon: "search",
          data: {trigger: "show-serch-modal"},
          tooltip: "Search...",
          tooltipAlignRight: true
        }),
        h("div.nav__group", {}, [
          IconButton({
            data: {action: "set-image-size", size: 24},
            icon: "photo_size_select_small",
            selected: config.imageSize === 24,
            tooltip: "Size: small (24x24)"
          }),
          IconButton({
            data: {action: "set-image-size", size: 32},
            icon: "photo_size_select_large",
            selected: config.imageSize === 32,
            tooltip: "Size: medium (32x32)"
          }),
          IconButton({
            data: {action: "set-image-size", size: 64},
            icon: "photo_size_select_actual",
            selected: config.imageSize === 64,
            tooltip: "Size: large (64x64)"
          })
        ]),
        h("div.nav__group", {}, [
          IconButton({
            data: {action: "set-background", background: null},
            icon: "panorama_fish_eye",
            selected: !config.background,
            tooltip: "Background: transparent"
          }),
          IconButton({
            data: {action: "set-background", background: "#ffffff"},
            icon: "lens",
            selected: config.background === "#ffffff",
            tooltip: "Background: white"
          })
        ]),
        h("div.nav__group", {}, [
          IconButton({
            data: {action: "set-padding", padding: false},
            icon: "grid_off",
            selected: !config.padding,
            tooltip: "Spacing between emoji: on"
          }),
          IconButton({
            data: {action: "set-padding", padding: true},
            icon: "grid_on",
            selected: config.padding,
            tooltip: "Spacing between emoji: off"
          })
        ]),
        IconButton({
          sel: "a",
          icon: "file_download",
          props: downloadButtonProps,
          tooltip: "Download"
        })
      ])
    ]);

  return vnode;

}

export default function Nav({dataToRender$, config$, initialLoading$, image$}) {

  const dom$ = most.combine(view, dataToRender$, config$, initialLoading$, image$);

  return {dom$};

}
