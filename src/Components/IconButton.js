import React from "react";
import classNames from "classnames";
import Icon from "./Icon.js";

export default function IconButton({ icon, className = "", onClick, disabled, selected }) {
  // const { icon, sel, cls, selected, data, props, tooltip, disabled } = config;

  const classes = classNames(className, "nav__btn", "icon-btn", {
    "icon-btn--selected": selected
    // "icon-button--disabled": disabled
  });

  return (
    <button className={classes} disabled={disabled} onClick={onClick}>
      <Icon type={icon} />
    </button>
  );
}
