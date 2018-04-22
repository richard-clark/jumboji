import React from "react";
import { connect } from "react-redux";
import TooltipContainer from "./TooltipContainer.js";
import IconButton from "./IconButton.js";

function ConfigMenu({
  className,
  imageSize,
  background,
  padding,
  variation,
  onSetImageSize,
  onSetBackground,
  onSetVariation,
  onSetPadding
}) {
  const menuItems = [
    {
      name: "Size",
      size: "s",
      items: [
        {
          onClick: () => onSetImageSize(24),
          icon: "photo_size_select_small",
          selected: imageSize === 24,
          tooltip: "Small (24x24)"
        },
        {
          onClick: () => onSetImageSize(32),
          icon: "photo_size_select_large",
          selected: imageSize === 32,
          tooltip: "Medium (32x32)"
        },
        {
          onClick: () => onSetImageSize(64),
          icon: "photo_size_select_actual",
          selected: imageSize === 64,
          tooltip: "Large (64x64)"
        }
      ]
    },
    {
      name: "Background",
      size: "m",
      items: [
        {
          onClick: () => onSetBackground("transparent"),
          icon: "panorama_fish_eye",
          selected: !background,
          tooltip: "Transparent"
        },
        {
          onClick: () => onSetBackground("#ffffff"),
          icon: "lens",
          selected: background === "#ffffff",
          tooltip: "White"
        }
      ]
    },
    {
      name: "Spacing between emoji",
      size: "l",
      items: [
        {
          onClick: () => onSetPadding(false),
          icon: "grid_off",
          selected: !padding,
          tooltip: "Off"
        },
        {
          onClick: () => onSetPadding(true),
          icon: "grid_on",
          selected: padding,
          tooltip: "On"
        }
      ]
    },
    {
      name: "Accuracy vs. Variation",
      size: "dropdown-only",
      items: [
        {
          onClick: () => onSetVariation(1),
          icon: "filter_1",
          selected: variation === 1,
          tooltip: "More Accuracy"
        },
        {
          onClick: () => onSetVariation(5),
          icon: "filter_2",
          selected: variation === 5,
          tooltip: "Medium"
        },
        {
          onClick: () => onSetVariation(10),
          icon: "filter_3",
          selected: variation === 10,
          tooltip: "More Variation"
        }
      ]
    }
  ];

  const children = menuItems.map((group, groupIndex) => {
    const items = group.items.map((item, itemIndex) => {
      return (
        <TooltipContainer tooltip={`${group.name}: ${item.tooltip}`} key={itemIndex}>
          <IconButton {...item} />
        </TooltipContainer>
      );
    });

    return (
      <div className={`nav__group nav-group--${group.size}`} key={groupIndex}>
        {items}
      </div>
    );
  });

  return (
    <div className={className}>
      {children}
    </div>
  )
}

function mapStateToProps(state) {
  return {
    imageSize: state.imageSize,
    background: state.background,
    padding: state.padding,
    variation: state.variation
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSetPadding(padding) {
      dispatch({
        type: "SET_PADDING",
        data: { padding }
      });
    },
    onSetImageSize(imageSize) {
      dispatch({
        type: "SET_IMAGE_SIZE",
        data: { imageSize }
      });
    },
    onSetBackground(background) {
      dispatch({
        type: "SET_BACKGROUND",
        data: { background }
      });
    },
    onSetVariation(variation) {
      dispatch({
        type: "SET_VARIATION",
        data: { variation }
      });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigMenu);
