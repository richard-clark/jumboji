import React from "react";
import classNames from "classnames";

export default function Dropdown({
  visible,
  children,
  className = "",
  pullRight,
  renderContent
}) {
  const classes = classNames(className, "dropdown", {
    "dropdown--active": visible,
    "dropdown--pull-right": pullRight
  });

  let content;
  if (visible) {
    content = renderContent();
  }

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

  return (
    <div className={classes}>
      {children}
      {content}
    </div>
  );
}
