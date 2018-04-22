const menuConfig = {
  background({ background, onSetBackground }) {
    return {
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
    };
  },

  padding({ padding, onSetPadding }) {
    return {
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
    };
  },

  size({ imageSize, onSetImageSize }) {
    return {
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
    };
  },

  variation({ variation, onSetVariation }) {
    return {
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
    };
  }
};

export default menuConfig;
