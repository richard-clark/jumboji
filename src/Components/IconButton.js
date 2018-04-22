import React from "react";
import classNames from "classnames";
import Icon from "./Icon.js";

export default function IconButton({
  icon,
  className = "",
  href,
  onClick,
  disabled,
  selected,
  download
}) {
  // A link can't be disabled
  if (disabled) {
    href = undefined;
  }
  let BtnOrA;
  if (href) {
    BtnOrA = "a";
  } else {
    BtnOrA = "button";
    download = undefined;
  }

  const classes = classNames(className, "nav__btn", "icon-btn", {
    "icon-btn--selected": selected
    // "icon-button--disabled": disabled
  });

  return (
    <BtnOrA
      className={classes}
      disabled={disabled}
      onClick={onClick}
      href={href}
      download={download}
    >
      <Icon type={icon} />
    </BtnOrA>
  );
}
