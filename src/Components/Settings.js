import {h} from "snabbdom/h";
import * as most from "most";
import {getMenuConfig} from "./menu.js";


function SettingsMenuButton(config) {

  const {icon, sel, cls, selected, data, props, tooltip} = config;

  const BASE_CLASS = {
    "settings-menu-btn": true,
    "settings-menu-btn--selected": selected || false
  };

  const vnode = {
    sel: sel || "button",
    data: {
      class: {...BASE_CLASS, ...(cls || {})},
      props: props || {},
      dataset: data
    },
    children: [
      h("div.settings-menu-btn__inner", {}, [
        h("i.material-icons.settings-menu-btn__icon", {}, icon),
        h("span.settings-menu-btn__text", tooltip)
      ])
    ]
  }

  return vnode;

}


function menuConfigToSettingsMenuSections(menuConfig) {
  // return menuConfig.map((group) => {
  //   return h("div.settings-menu__section", {},
  //     group.map(SettingsMenuButton)
  //   )
  // });
  return "";
}

function dom(config, show) {

  const menuConfig = getMenuConfig(config);
  const settingsMenuSections = menuConfigToSettingsMenuSections(menuConfig);

  const modal = h("div.modal-container__modal", {}, [

    h("div.settings-menu", {}, [
      h("button.modal-container__close-btn", {
        dataset: {trigger: "close-settings-menu"}
      }, h("i.material-icons", {}, "close")),
      ...settingsMenuSections
    ])

  ]);

  return h("div.modal-container", {
    class: {
      "modal-container--visible": show
    }
  }, [
    h("div.modal-container__overlay", {}),
    modal
  ]);

}

export default function Search({config$, settingsMenuVisible$}) {

  const dom$ = most.combine(dom, config$, settingsMenuVisible$);

  return { dom$ }

}
