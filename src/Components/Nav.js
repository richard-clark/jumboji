import {h} from "snabbdom/h";
import * as most from "most";
import convert from "color-convert";
import {getMenuConfig} from "./menu.js";
import {DropdownContent,
  DropdownContentFromMenuConfig,
  Dropdown,
  DropdownToggle
} from "./dropdown.js";
import Search from "./Search.js";

function TooltipContainer({tooltip, tooltipAlignRight, trigger, disabled}) {

  if (disabled) {
    return trigger;
  }

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

  const {icon, sel, cls, selected, data, props, tooltip, disabled} = config;

  const BASE_CLASS = {
    nav__btn: true,
    "icon-btn": true,
    "icon-btn--selected": selected || false,
    "icon-btn--disabled": disabled,
  };

  const vnode = {
    sel: sel || "button",
    data: {
      class: {...BASE_CLASS, ...(cls || {})},
      props: props || {
        disabled: disabled || false
      },
      dataset: data || {},
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

function menuConfigToToolbarElements(menuConfig) {
  return menuConfig.map((group) => {
    return h(`div.nav__group.nav__group--${group.size}`, {},
      group.items.map((item) => IconButton({
        ...item,
        tooltip: `${group.name}: ${item.tooltip}`
      }))
    );
  })
}

function SearchButton({config}) {
  const button = h("button", {
    class: {
      "search-button": true
    },
    dataset: {trigger: "show-serch-modal"}
  }, h("div.search-button__inner", {}, [
    h("i.material-icons.search-button__icon", {}, "search"),
    h("span.search-button__emoji", {}, config.emoji)
  ]));

  return TooltipContainer({
    tooltip: "Search...",
    tooltipAlignRight: true,
    trigger: DropdownToggle({
      vnode: button,
      name: "search"
    })
  });
}

function view({palette}, config, initialLoading, imageUrl, visibleDropdown, searchVnode) {

  const navStyle = getNavStyle(palette);
  const style = `background-color:${navStyle.backgroundColor}`;

  let downloadButtonProps = {};
  if (imageUrl) {
    downloadButtonProps = {
      download: "emoji.png",
      href: imageUrl
    };
  }

  const menuConfig = getMenuConfig(config);
  const toolbarElements = menuConfigToToolbarElements(menuConfig);

  const vnode = h(`nav`,
    {
      class: {
        main__nav: true,
        nav: true,
        'nav--fg-light': !navStyle.useDarkTheme,
        'nav--fg-dark': navStyle.useDarkTheme,
        "nav--visible": !initialLoading
      },
      style: {
        "background-color": navStyle.backgroundColor
      },
      key: "nav"
    }, [
      h("div.nav__inner", {key: "nav-inner"}, [
        h("div.nav__group", {}, [
          Dropdown({
            visible: visibleDropdown === "search",
            name: "search",
            pullRight: true,
            cls: { "dropdown--search-dropdown": true },
            children: [
              SearchButton({config}),
              searchVnode,
            ]
          }),
          IconButton({
            icon: "refresh",
            data: {trigger: "randomize"},
            tooltip: "Random emoji 🍀",
            tooltipAlignRight: true
          })
        ]),
        ...toolbarElements,
        h("div.nav__group", {}, [
          Dropdown({
            visible: visibleDropdown === "settings",
            name: "settings",
            children: [
              DropdownToggle({
                vnode: IconButton({
                  sel: "button",
                  icon: "more_vert",
                  tooltip: "Settings"
                }),
                name: "settings"
              }),
              DropdownContentFromMenuConfig({menuConfig})
            ]
          }),
          IconButton({
            sel: "a",
            icon: "file_download",
            props: downloadButtonProps,
            disabled: !imageUrl,
            tooltip: "Download"
          })
        ])
      ])
    ]);

  return vnode;

}

export default function Nav({
  dataToRender$,
  config$,
  initialLoading$,
  imageBlob$,
  visibleDropdown$,
  dataMatchingSearch$,
  searchParams$
}) {

  let search = Search({ dataMatchingSearch$, searchParams$ });

  const dom$ = most.combine(
    view,
    dataToRender$,
    config$,
    initialLoading$,
    imageBlob$,
    visibleDropdown$,
    search.dom$
  );

  return {dom$};

}
