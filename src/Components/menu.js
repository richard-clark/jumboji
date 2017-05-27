export function getMenuConfig(config) {
  return [
    {
      name: "Size",
      size: "s",
      items: [
        {
          data: {action: "set-image-size", size: 24},
          icon: "photo_size_select_small",
          selected: config.imageSize === 24,
          tooltip: "Small (24x24)"
        }, {
          data: {action: "set-image-size", size: 32},
          icon: "photo_size_select_large",
          selected: config.imageSize === 32,
          tooltip: "Medium (32x32)"
        }, {
          data: {action: "set-image-size", size: 64},
          icon: "photo_size_select_actual",
          selected: config.imageSize === 64,
          tooltip: "Large (64x64)"
        }
      ]
    }, {
      name: "Background",
      size: "m",
      items: [
        {
          data: {action: "set-background", background: "transparent"},
          icon: "panorama_fish_eye",
          selected: !config.background,
          tooltip: "Transparent"
        }, {
          data: {action: "set-background", background: "#ffffff"},
          icon: "lens",
          selected: config.background === "#ffffff",
          tooltip: "White"
        }
      ]
    }, {
      name: "Spacing between emoji",
      size: "l",
      items: [
        {
          data: {action: "set-padding", padding: "false"},
          icon: "grid_off",
          selected: !config.padding,
          tooltip: "Off"
        }, {
          data: {action: "set-padding", padding: "true"},
          icon: "grid_on",
          selected: config.padding,
          tooltip: "On"
        }
      ]
    }, {
      name: "Accuracy vs. Variation",
      size: "dropdown-only",
      items: [
        {
          data: {action: "set-neighbors", sampleNeighbors: 1},
          icon: "filter_1",
          selected: config.sampleNeighbors === 1,
          tooltip: "More Accuracy"
        }, {
          data: {action: "set-neighbors", sampleNeighbors: 5},
          icon: "filter_2",
          selected: config.sampleNeighbors === 5,
          tooltip: "Medium"
        }, {
          data: {action: "set-neighbors", sampleNeighbors: 8},
          icon: "filter_3",
          selected: config.sampleNeighbors === 8,
          tooltip: "More Variation"
        }
      ]
    }
  ]
}
