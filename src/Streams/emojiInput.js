import * as utils from "../utils.js";
import * as most from "most";

function EmojiChar$(data$) {
  return data$.map((data) => {
    const chars = data.map(utils.getChar);
    return new Set(chars);
  }).multicast();
}

function handleEmojiInputSubmit(validChars) {
  if (!validChars) {
    return { loading: true };
  }

  const char = document.querySelector(".emoji-input").value;

  return {
    loading: false,
    valid: validChars.has(char),
    char
  };
}

export function EmojiInput$({clickWithDataTarget$, data$}) {
  const emojiChar$ = EmojiChar$(data$);

  return clickWithDataTarget$
    .filter(({trigger}) => trigger === "emoji-input-submit")
    .sample(handleEmojiInputSubmit, emojiChar$);
}

export function EmojiInputInvalid$({emojiInput$}) {

  const invalidEmojiInputs$ = emojiInput$
    .filter((action) => !action.valid)
    .map(() => (new Date()).getTime())
    .multicast();

  const invalidCls$ = most.merge(
    invalidEmojiInputs$.map(() => true),
    invalidEmojiInputs$.delay(800)
      .sample((x) => (new Date()).getTime() - x, invalidEmojiInputs$)
      .filter((delay) => delay >= 800)
      .map(() => false)
  )
  .skipRepeats()
  .startWith(false)
  .multicast();

  return invalidCls$;

}
