import React from "react";
import TooltipContainer from "./TooltipContainer.js";
import IconButton from "./IconButton.js";

export default function NavMenu(props) {
  const config = props.config(props);

  const items = config.items.map((item, itemIndex) => {
    return (
      <TooltipContainer
        tooltip={`${config.name}: ${item.tooltip}`}
        key={itemIndex}
      >
        <IconButton {...item} />
      </TooltipContainer>
    );
  });

  return <div className={`nav__group nav__group--${config.size}`}>{items}</div>;
}
