import React from "react";
import TooltipContainer from "./TooltipContainer.js";
import Icon from "./Icon.js";

export default function SearchToggleButton({onClick, children}) {
  return (
    <TooltipContainer tooltip="Search..." alignRight={true}>
      <button className="search-button" onClick={onClick}>
        <Icon className="search-button__icon" type="search" />
        <span className="search-button__emoji">{children}</span>
      </button>
    </TooltipContainer>
  );
}


// function SearchButton({config}) {
//   const button = h("button", {
//     class: {
//       "search-button": true
//     },
//     dataset: {trigger: "show-serch-modal"}
//   }, h("div.search-button__inner", {}, [
//     h("i.material-icons.search-button__icon", {}, "search"),
//     h("span.search-button__emoji", {}, config.emoji)
//   ]));
//
//   return TooltipContainer({
//     tooltip: "Search...",
//     tooltipAlignRight: true,
//     trigger: DropdownToggle({
//       vnode: button,
//       name: "search"
//     })
//   });
// }
