import * as utils from "../utils.js";

export default function EmojiToNameMap$({data$}) {
  return data$
    .map((data) => {
      return data.reduce((map, point) => {
        const char = point.char
        const name = utils.getURLSafeName(point.name);
        map.nameForChar[char] = name;
        map.charForName[name] = char;
        return map;
      }, {
        nameForChar: {},
        charForName: {}
      })
    }).multicast();
}
