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
          data: {action: "set-background", background: null},
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
          data: {action: "set-padding", padding: false},
          icon: "grid_off",
          selected: !config.padding,
          tooltip: "Off"
        }, {
          data: {action: "set-padding", padding: true},
          icon: "grid_on",
          selected: config.padding,
          tooltip: "On"
        }
      ]
    }
  ]
}
