import React from "react";
import classNames from "classnames";

export default function TooltipContainer({
  tooltip,
  alignRight,
  children,
  disabled
}) {
  if (disabled) {
    return children;
  }

  const tooltipClasses = classNames("tooltip-container__tooltip", {
    "tooltip-container__tooltip--align-right": alignRight
  });

  return (
    <div className="tooltip-container">
      <div className="tooltip-container__trigger">{children}</div>
      <div className={tooltipClasses}>{tooltip}</div>
    </div>
  );
}
