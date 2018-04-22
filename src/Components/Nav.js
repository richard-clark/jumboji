import React from "react";
import classNames from "classnames";
import Dropdown from "./Dropdown.js";
import Search from "./Search.js";
import SearchToggleButton from "./SearchToggleButton.js";
import { connect } from "react-redux";
import convert from "color-convert";
import TooltipContainer from "./TooltipContainer.js";
import IconButton from "./IconButton.js";
import ConfigMenu from "./ConfigMenu.js"

// function IconButton(config) {
//
//   const {icon, sel, cls, selected, data, props, tooltip, disabled} = config;
//
//   const BASE_CLASS = {
//     nav__btn: true,
//     "icon-btn": true,
//     "icon-btn--selected": selected || false,
//     "icon-btn--disabled": disabled,
//   };
//
//   const vnode = {
//     sel: sel || "button",
//     data: {
//       class: {...BASE_CLASS, ...(cls || {})},
//       props: props || {
//         disabled: disabled || false
//       },
//       dataset: data || {},
//     },
//     children: [
//       h("i.material-icons", {}, icon)
//     ]
//   }
//
//   if (tooltip) {
//     return TooltipContainer({...config, trigger: vnode});
//   } else {
//     return vnode;
//   }
//
// }

function colorToRGBString(color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function getNavStyle(palette) {
  // dominantColor
  palette = palette || [[255, 255, 255]];
  const backgroundColor = palette[0];
  const bgColorInHSL = convert.rgb.hsl(backgroundColor);
  const useDarkTheme = bgColorInHSL[2] > 50;
  const inputBGColor = backgroundColor.map(component =>
    Math.round(255 * 0.8 + component * 0.2)
  );
  return {
    backgroundColor: colorToRGBString(backgroundColor),
    useDarkTheme,
    inputBackgroundColor: colorToRGBString(inputBGColor)
  };
}

function renderSearch() {
  return <Search />;
}

function Nav({
  palette,
  initialLoading,
  imageUrl,
  emoji,
  onRandomizeEmoji,
  onShowDropdown,
  visibleDropdown
}) {
  const navStyle = getNavStyle(palette);
  const style = {
    backgroundColor: navStyle.backgroundColor
  };

  const navClasses = classNames("main__nav", "nav", {
    "nav--fg-light": !navStyle.useDarkTheme,
    "nav--fg-dark": navStyle.useDarkTheme,
    "nav--visible": !initialLoading
  });

  return (
    <nav className={navClasses} style={style}>
      <div className="nav__inner">
        <div className="nav__group">
          <Dropdown
            visible={visibleDropdown === "search"}
            pullRight={true}
            className="dropdown--search-dropdown"
            renderContent={renderSearch}
          >
            <SearchToggleButton onClick={() => onShowDropdown("search")}>
              {emoji}
            </SearchToggleButton>
          </Dropdown>
          <TooltipContainer alignRight={true} tooltip="Random emoji 🍀">
            <IconButton icon="refresh" onClick={onRandomizeEmoji} />
          </TooltipContainer>
        </div>
        <ConfigMenu className="nav__group" />
      </div>
    </nav>
  );
}

function mapStateToProps(state) {
  return {
    emoji: state.emoji,
    initialLoading: state.initialLoading,
    palette: state.palette,
    visibleDropdown: state.visibleDropdown
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onRandomizeEmoji() {
      dispatch({ type: "RANDOMIZE_EMOJI" });
    },
    onShowDropdown(name) {
      dispatch({ type: "SHOW_DROPDOWN", data: { name } });
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav);

// function view({palette}, config, initialLoading, imageUrl, visibleDropdown, searchVnode) {
//
//   let downloadButtonProps = {};
//   if (imageUrl) {
//     downloadButtonProps = {
//       download: "emoji.png",
//       href: imageUrl
//     };
//   }
//
//   const menuConfig = getMenuConfig(config);
//   const toolbarElements = menuConfigToToolbarElements(menuConfig);
//
//   const vnode = h(`nav`,
//     {}, [
//       h("div.nav__inner", {key: "nav-inner"}, [

//         ...toolbarElements,
//         h("div.nav__group", {}, [
//           Dropdown({
//             visible: visibleDropdown === "settings",
//             name: "settings",
//             children: [
//               DropdownToggle({
//                 vnode: IconButton({
//                   sel: "button",
//                   icon: "more_vert",
//                   tooltip: "Settings"
//                 }),
//                 name: "settings"
//               }),
//               DropdownContentFromMenuConfig({menuConfig})
//             ]
//           }),
//           IconButton({
//             sel: "a",
//             icon: "file_download",
//             props: downloadButtonProps,
//             disabled: !imageUrl,
//             tooltip: "Download"
//           })
//         ])
//       ])
//     ]);
//
//   return vnode;
//
// }
//
// export default function Nav({
//   dataToRender$,
//   config$,
//   initialLoading$,
//   imageBlob$,
//   visibleDropdown$,
//   dataMatchingSearch$,
//   searchParams$
// }) {
//
//   let search = Search({ dataMatchingSearch$, searchParams$, visibleDropdown$ });
//
//   const dom$ = most.combine(
//     view,
//     dataToRender$,
//     config$,
//     initialLoading$,
//     imageBlob$,
//     visibleDropdown$,
//     search.dom$
//   );
//
//   return {dom$};
//
// }
