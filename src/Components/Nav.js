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
  palette = palette || [[255, 255, 255]];
  const backgroundColor = palette[0];
  const bgColorInHSL = convert.rgb.hsl(backgroundColor);
  const useDarkTheme = bgColorInHSL[2] > 50;
  const inputBGColor = backgroundColor.map((component) =>
    Math.round(255*0.8 + component*0.2)
  );
  return {
    backgroundColor: colorToRGBString(backgroundColor),
    useDarkTheme,
    inputBackgroundColor: colorToRGBString(inputBGColor)
  };
}


function ImageBlob$({image$}) {

  return image$
    .skipRepeats()
    .map((image) => {
      if (image) {
        // http://stackoverflow.com/a/16245768
        const splitIndex = image.indexOf(",");
        const imageData = atob(image.slice(splitIndex+1));
        let binaryData = new Array(imageData.length);
        for (let i = 0; i < binaryData.length; i++) {
          binaryData[i] = imageData.charCodeAt(i);
        }
        const byteArray = new Uint8Array(binaryData);
        // http://stackoverflow.com/a/23956661
        const blob = new Blob([byteArray], {type: "image/png"});
        return blob;
      } else {
        return image;
      }
    });

}

function view({palette}, config, initialLoading, imageBlob) {

  const navStyle = getNavStyle(palette);
  const style = `background-color:${navStyle.backgroundColor}`;

  let downloadButtonProps = {style: "cursor:not-allowed"};
  if (imageBlob) {
    // http://stackoverflow.com/a/23956661
    const url = URL.createObjectURL(imageBlob);

    downloadButtonProps = {
      download: "emoji.png",
      href: url,
      style: ""
    };
  }

  const vnode = h(`nav`,
    {
      class: {
        main__nav: true,
        nav: true,
        'nav--fg-light': !navStyle.useDarkTheme,
        'nav--fg-dark': navStyle.useDarkTheme,
        "nav--visible": !initialLoading
      },
      props: {style},
      key: "nav"
    }, [
      h("div.nav__inner", {key: "nav-inner"}, [
        h("div.nav__group", {}, [
          TooltipContainer({
            tooltip: "Search...",
            tooltipAlignRight: true,
            trigger: h("button", {
              class: {
                "search-button": true
              },
              dataset: {trigger: "show-serch-modal"}
            }, h("div.search-button__inner", {}, [
              h("i.material-icons.search-button__icon", {}, "search"),
              h("span.search-button__emoji", {}, config.emoji)
            ]))
          }),
          IconButton({
            icon: "refresh",
            data: {trigger: "randomize"},
            tooltip: "Random emoji 🍀",
            tooltipAlignRight: true
          })
        ]),
        h("div.nav__group.nav__group--l", {}, [
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
        h("div.nav__group.nav__group--l", {}, [
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
        h("div.nav__group.nav__group--l", {}, [
          IconButton({
            data: {action: "set-padding", padding: false},
            icon: "grid_off",
            selected: !config.padding,
            tooltip: "Spacing between emoji: off"
          }),
          IconButton({
            data: {action: "set-padding", padding: true},
            icon: "grid_on",
            selected: config.padding,
            tooltip: "Spacing between emoji: on"
          })
        ]),
        IconButton({
          sel: "button",
          icon: "settings",
          props: {cls: {".nav__btn--hamburger": true}},
          tooltip: "Download"
        }),
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

export default function Nav({
  dataToRender$,
  config$,
  initialLoading$,
  image$
}) {

  const imageBlob$ = ImageBlob$({image$});

  const dom$ = most.combine(
    view,
    dataToRender$,
    config$,
    initialLoading$,
    imageBlob$
  );

  return {dom$};

}
