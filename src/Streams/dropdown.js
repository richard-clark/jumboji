import * as most from "most";

export function VisibleDropdown$({clickWithDataTarget$}) {

  const escKey$ = most.fromEvent("keyup", document)
    .filter((event) => event.keyCode === 27)
    .map(() => ({type: "close-dropdown"}));

  const openButton$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "open-dropdown");

  const closeButton$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "close-dropdown");

  const visibleDropdown$ = most.merge(
    escKey$,
    openButton$,
    closeButton$
  ).map((event) => {
    if (event.trigger === "open-dropdown") {
      return event.name;
    }
    return null;
  }).skipRepeats()
    .startWith(null)
    .multicast();

  return visibleDropdown$;

}
