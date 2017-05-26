import {h} from "snabbdom/h";

function DropdownButton(item) {
  return h("button.dropdown-btn", {
    class: {
      "dropdown-btn--selected": item.selected
    },
    dataset: item.data || {}
  }, [
    h("i.material-icons.dropdown-btn__icon", {}, item.icon),
    h("span.dropdown-btn__text", {}, item.tooltip)
  ])
}

function CloseButton() {
  return h("button.dropdown__close", {
    dataset: {trigger: "close-dropdown"}
  },
    h("i.material-icons", {}, "close")
  );
}

export function DropdownContent({content}) {

  return h("div.dropdown__content", {}, [
    CloseButton(),
    h("div.dropdown__content-inner", {}, content)
  ]);

}

export function DropdownContentFromMenuConfig({menuConfig}) {

  const content = menuConfig.map((group) => {
    return h(`div.dropdown-group.dropdown-group--${group.size}`, {}, [
      h("h3.dropdown-group__heading", {}, group.name),
      h("h3.dropdown-group__content", {},
        group.items.map(DropdownButton)
      ),
    ]);
  });

  return DropdownContent({content})

}

export function DropdownToggle({name, vnode}) {
  vnode.data.dataset = {
    ...(vnode.data.dataset || {}),
    trigger: "open-dropdown",
    name
  };
  return vnode;
}

export function Dropdown({visible, name, children, cls, pullRight}) {
  return h("div.dropdown", {
    class: {
      ...(cls || {}),
      "dropdown--active": visible,
      "dropdown--pull-right": pullRight
    },
    dataset: {
      dropdown: name
    }
  }, children);
}
