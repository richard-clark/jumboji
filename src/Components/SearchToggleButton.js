import React from "react";
import TooltipContainer from "./TooltipContainer.js";
import Icon from "./Icon.js";

export default function SearchToggleButton({onClick, children}) {
  return (
    <TooltipContainer tooltip="Search..." alignRight={true}>
      <button className="search-button" onClick={onClick}>
        <div className="search-button__inner">
          <Icon className="search-button__icon" type="search" />
          <span className="search-button__emoji">{children}</span>
        </div>
      </button>
    </TooltipContainer>
  );
}
