import * as most from "most";
import { proxy } from "most-proxy";

function getParentDropdown(event) {
  let element = event.target;
  while (element) {
    if (element.dataset && element.dataset.dropdown) {
      return element.dataset.dropdown;
    }
    element = element.parentElement;
  }
}

export function VisibleDropdown$({clickWithDataTarget$}) {

  let visibleDropdown$;

  const escKey$ = most.fromEvent("keyup", document)
    .filter((event) => event.keyCode === 27)
    .map(() => ({type: "close-dropdown"}));

  const openButton$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "open-dropdown");

  const closeButton$ = clickWithDataTarget$
    .filter(({trigger}) => trigger === "close-dropdown");

  const clickProxy = proxy();

  visibleDropdown$ = most.merge(
    escKey$,
    openButton$,
    closeButton$,
    clickProxy.stream
  ).map((event) => {
    if (event.trigger === "open-dropdown") {
      return event.name;
    }
    return null;
  }).skipRepeats()
    .startWith(null)
    .multicast();

  const click$ = most.fromEvent("mouseup", document, true)
    .map((event) => ({event, dropdown: getParentDropdown(event)}));

  const close$ = most.sample(
      ({event, dropdown}, visibleDropdown) =>
        ({event, dropdown, visibleDropdown}),
      click$,
      click$,
      visibleDropdown$
    )
    .filter(({dropdown, visibleDropdown}) =>
      visibleDropdown && !dropdown
    )
    .tap(({event, dropdown, visibleDropdown}) => {
      event.stopPropagation();
      return false;
    })
    .map(() => ({trigger: "close-dropdown"}));

  clickProxy.attach(close$);

  return visibleDropdown$;

}
