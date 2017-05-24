import {h} from "snabbdom/h";
import * as most from "most";
import {getMenuConfig} from "./menu.js";

function dom(visibleModals) {

  const event = visibleModals[0];
  let modal = "";

  if (event) {

    modal = h("div.modal-container__modal", {}, [
      event.dom
    ]);

  }
  return h("div.modal-container", {
    class: {
      "modal-container--visible": event
    }
  }, [
    h("div.modal-container__overlay", {}),
    modal
  ]);

}

export default function GenericModal({genericModal$}) {

  const dom$ = genericModal$
    .tap((ev) => console.log("Generic modal", ev))
    .scan((visible, event) => {
      visible = visible.filter(({id}) => id !== event.id);
      if (event.type === "show") {
        return [...visible, event];
      }
      return visible;
    }, [])
    .startWith([])
    .map(dom);

  return { dom$ }

}
