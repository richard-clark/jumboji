import React from "react";
import classNames from "classnames";

function Icon({ type, className = "" }) {
  return <i className={`${className} material-icons`}>{type}</i>;
}

function DropdownButton({ selected, onClick, icon, children }) {
  const classes = classNames("dropdown-btn", {
    "dropdown-btn--selected": selected
  });

  return (
    <button className={classes} onClick={onClick}>
      <Icon className="dropdown-btn__icon" type={icon} />
      <span className="dropdown-btn__text">{children}</span>
    </button>
  );

  // return h("button.dropdown-btn", {
  //   class: {
  //     "dropdown-btn--selected": item.selected
  //   },
  //   dataset: item.data || {}
  // }, [
  //   h("i.material-icons.dropdown-btn__icon", {}, item.icon),
  //   h("span.dropdown-btn__text", {}, item.tooltip)
  // ])
}

function CloseButton({ onClick }) {
  return (
    <button className="dropdown__close">
      <Icon type="close" />
    </button>
  );

  // return h(
  //   "button.dropdown__close",
  //   {
  //     dataset: { trigger: "close-dropdown" }
  //   },
  //   h("i.material-icons", {}, "close")
  // );
}

export function DropdownContent({ children, onClose }) {
  return (
    <div className="dropdown__content">
      <CloseButton onClick={onClose} />
      <div className="dropdown__content-inner">{children}</div>
    </div>
  );

  // return h("div.dropdown__content", {}, [
  //   CloseButton(),
  //   h("div.dropdown__content-inner", {}, content)
  // ]);
}

export function DropdownContentFromMenuConfig({ menuConfig }) {
  const children = menuConfig.map(group => {
    return (
      <div className={`dropdown-group dropdown-group--${groupsize}`}>
        <h3 className="dropdown-group__heading">{name}</h3>
        <h3 className="dropdown-group__content">
          {group.items.map(props => <DropdownButton {...props} />)}
        </h3>
      </div>
    );

    // return h(`div.dropdown-group.dropdown-group--${group.size}`, {}, [
    //   h("h3.dropdown-group__heading", {}, group.name),
    //   h("h3.dropdown-group__content", {}, group.items.map(DropdownButton))
    // ]);
  });

  return <DropdownContent onClose={onClose}>{children}</DropdownContent>;

  // return DropdownContent({ content });
}

export function DropdownToggle({ name, vnode }) {
  vnode.data.dataset = {
    ...(vnode.data.dataset || {}),
    trigger: "open-dropdown",
    name
  };
  return vnode;
}

export function Dropdown({ visible, children, cls = "", pullRight }) {
  const classes = classNames(cls, "dropdown", {
    "dropdown--active": visible,
    "dropdown--pull-right": pullRight
  });

  // return h(
  //   "div.dropdown",
  //   {
  //     class: {
  //       ...(cls || {}),
  //       "dropdown--active": visible,
  //       "dropdown--pull-right": pullRight
  //     },
  //     dataset: {
  //       dropdown: name
  //     }
  //   },
  //   children
  // );

  return <div className={classes}>{children}</div>;
}
