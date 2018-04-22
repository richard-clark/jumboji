import React from "react";
import Icon from "./Icon.js";

function CloseButton({ onClick }) {
  return (
    <button className="dropdown__close">
      <Icon type="close" />
    </button>
  );
}

export default function DropdownContent({ children, onClose }) {
  return (
    <div className="dropdown__content">
      <CloseButton onClick={onClose} />
      <div className="dropdown__content-inner">{children}</div>
    </div>
  );
}
