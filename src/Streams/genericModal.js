import * as most from "most";
import {h} from "snabbdom/h";

function unsupportedModalView(unsupportedInfo) {

  return h("div.settings-menu", {}, [
    h("h1", {}, "Missing emoji detected"),
    h("h2", {}, "😞"),
    h("p", {}, `There are ${unsupportedInfo.totalCount.toLocaleString()} emoji
      in total, but your browser doesn't support
      ${unsupportedInfo.unsupportedCount.toLocaleString()} of them.`),
    h("p", {}, `You can still use Jumboji, but you'll need to update your
      operating system to take advantage of all the emoji goodness.`),
    h("button", {
      dataset: {trigger: "close-generic-modal", id: "unsupported"}
    }, "Got it")
  ]);

}

export default function GenericModal$({allData$, appearanceData$, clickWithDataTarget$}) {

  // const unsupportedInfo$ = most.combine(
  //   (data, appearanceData) => ({
  //     totalCount: data.length,
  //     unsupportedCount: data.filter((point) => !appearanceData.data[point.num].supported).length
  //   }),
  //   allData$,
  //   appearanceData$
  // )
  //   .startWith({totalCount: 0, unsupportedCount: 0})
  //   .multicast();
  //
  // const showUnsupportedModal$ = unsupportedInfo$
  //   .filter(({unsupportedCount}) => unsupportedCount > 0)
  //   .take(1)
  //   .map((unsupportedInfo) => ({
  //     type: "show",
  //     id: "unsupported",
  //     dom: unsupportedModalView(unsupportedInfo)
  //   }));
  //
  // const hideModal$ = clickWithDataTarget$
  //   .filter(({trigger}) => trigger === "close-generic-modal")
  //   .map(({id}) => ({type: "hide", id}))
  //   .tap((ev) => console.log("hide modal", ev));
  //
  // return most.merge(showUnsupportedModal$, hideModal$);

  return most.empty()

}
