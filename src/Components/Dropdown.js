import React, { PureComponent } from "react";
import classNames from "classnames";
import Icon from "./Icon.js";

function CloseButton({ onClick }) {
  return (
    <button className="dropdown__close" onClick={onClick}>
      <Icon type="close" />
    </button>
  );
}

function DropdownContent({ children, onClose }) {
  return (
    <div className="dropdown__content">
      <CloseButton onClick={onClose} />
      <div className="dropdown__content-inner">{children}</div>
    </div>
  );
}

function isAncestor(ancestor, element) {
  while (element && element !== ancestor) {
    element = element.parentElement;
  }
  return element === ancestor;
}

export default class Dropdown extends PureComponent {
  constructor(props) {
    super(props);
    this.contentElement = null;
    this.setContentElement = element => {
      this.contentElement = element;
    };
    this.onMouseDown = e => {
      if (this.contentElement && !isAncestor(this.contentElement, e.target)) {
        e.stopImmediatePropagation();
        this.props.onClose();
      }
    };
  }
  componentDidMount() {
    document.addEventListener("click", this.onMouseDown, true);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.onMouseDown);
  }
  render() {
    const {
      visible,
      children,
      className = "",
      pullRight,
      renderContent,
      onClose
    } = this.props;

    const classes = classNames(className, "dropdown", {
      "dropdown--active": visible,
      "dropdown--pull-right": pullRight
    });

    let content;
    if (visible) {
      content = (
        <div ref={this.setContentElement}>
          <DropdownContent onClose={onClose}>{renderContent()}</DropdownContent>
        </div>
      );
    }

    return (
      <div className={classes}>
        {children}
        {content}
      </div>
    );
  }
}
