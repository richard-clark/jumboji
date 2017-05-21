import * as snabbdom from "snabbdom";
import * as most from "most";
import dataset from "snabbdom/modules/dataset";
import props from "snabbdom/modules/props";
import eventlisteners from "snabbdom/modules/eventlisteners";

export default function domSink({documentReady$, dom$}) {
  const patch = snabbdom.init([
    dataset,
    props,
    eventlisteners
  ]);

  let vnode = null;
  function render(newVnode) {
    if (!vnode) {
      vnode = document.createElement("div");
      document.body.appendChild(vnode);
    }
    patch(vnode, newVnode);
    vnode = newVnode;
  }

  most.combine(
    (dom) => dom,
    dom$,
    documentReady$
  ).observe(render);
}
