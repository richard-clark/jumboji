import React from "react";
import classNames from "classnames";
import Dropdown from "./Dropdown.js";
import Search from "./Search.js";
import SearchToggleButton from "./SearchToggleButton.js";
import { connect } from "react-redux";
import convert from "color-convert";
import TooltipContainer from "./TooltipContainer.js";
import IconButton from "./IconButton.js";

import menuConfig from "./menuConfig.js";
import menuComponent from "./menuComponent.js";
import NavMenu from "./NavMenu.js";
import DropdownMenu from "./DropdownMenu.js";

const SizeMenu = menuComponent(NavMenu, menuConfig.size);
const BackgroundMenu = menuComponent(NavMenu, menuConfig.background);
const PaddingMenu = menuComponent(NavMenu, menuConfig.padding);
const VariationMenu = menuComponent(NavMenu, menuConfig.variation);

const DropdownSize = menuComponent(DropdownMenu, menuConfig.size);
const DropdownBackground = menuComponent(DropdownMenu, menuConfig.background);
const DropdownPadding = menuComponent(DropdownMenu, menuConfig.padding);
const DropdownVariation = menuComponent(DropdownMenu, menuConfig.variation);

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

function renderMenu() {
  return (
    <div>
      <DropdownSize />
      <DropdownBackground />
      <DropdownPadding />
      <DropdownVariation />
    </div>
  );
}

function Nav({
  palette,
  initialLoading,
  imageUrl,
  emoji,
  onCloseDropdown,
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
        <div className="nav__group" key="search">
          <Dropdown
            visible={visibleDropdown === "search"}
            pullRight={true}
            className="dropdown--search-dropdown"
            renderContent={renderSearch}
            onClose={onCloseDropdown}
          >
            <SearchToggleButton onClick={() => onShowDropdown("search")}>
              {emoji}
            </SearchToggleButton>
          </Dropdown>
          <TooltipContainer alignRight={true} tooltip="Random emoji 🍀">
            <IconButton icon="refresh" onClick={onRandomizeEmoji} />
          </TooltipContainer>
        </div>
        <SizeMenu />
        <BackgroundMenu />
        <PaddingMenu />
        <VariationMenu />
        <div className="nav__group" key="menu">
          <Dropdown
            visible={visibleDropdown === "settings"}
            renderContent={renderMenu}
            onClose={onCloseDropdown}
          >
            <TooltipContainer tooltip="More Settings">
              <IconButton
                icon="more_vert"
                onClick={() => onShowDropdown("settings")}
              />
            </TooltipContainer>
          </Dropdown>
        </div>
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
    onCloseDropdown() {
      dispatch({ type: "CLOSE_DROPDOWN" });
    },
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
