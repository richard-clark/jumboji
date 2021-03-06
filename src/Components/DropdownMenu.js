import React from "react";
import Icon from "./Icon.js";
import classNames from "classnames";

function DropdownButton({ selected, onClick, icon, tooltip }) {
  const classes = classNames("dropdown-btn", {
    "dropdown-btn--selected": selected
  });

  return (
    <button className={classes} onClick={onClick}>
      <Icon className="dropdown-btn__icon" type={icon} />
      <span className="dropdown-btn__text">{tooltip}</span>
    </button>
  );
}

export default function DropdownMenu(props) {
  const config = props.config(props);

  const children = config.items.map(props => (
    <DropdownButton {...props} key={props.tooltip} />
  ));

  return (
    <div className={`dropdown-group dropdown-group--${config.size}`}>
      <h3 className="dropdown-group__heading">{config.name}</h3>
      <div className="dropdown-group__content">{children}</div>
    </div>
  );
}
