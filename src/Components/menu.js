export function getMenuConfig(config) {
  return [
    [
      {
        data: {action: "set-image-size", size: 24},
        icon: "photo_size_select_small",
        selected: config.imageSize === 24,
        tooltip: "Size: small (24x24)"
      }, {
        data: {action: "set-image-size", size: 32},
        icon: "photo_size_select_large",
        selected: config.imageSize === 32,
        tooltip: "Size: medium (32x32)"
      }, {
        data: {action: "set-image-size", size: 64},
        icon: "photo_size_select_actual",
        selected: config.imageSize === 64,
        tooltip: "Size: large (64x64)"
      }
    ], [
      {
        data: {action: "set-background", background: null},
        icon: "panorama_fish_eye",
        selected: !config.background,
        tooltip: "Background: transparent"
      }, {
        data: {action: "set-background", background: "#ffffff"},
        icon: "lens",
        selected: config.background === "#ffffff",
        tooltip: "Background: white"
      }
    ], [
      {
        data: {action: "set-padding", padding: false},
        icon: "grid_off",
        selected: !config.padding,
        tooltip: "Spacing between emoji: off"
      }, {
        data: {action: "set-padding", padding: true},
        icon: "grid_on",
        selected: config.padding,
        tooltip: "Spacing between emoji: on"
      }
    ]
  ]
}
