import * as most from "most";
import createHistory from "history/createBrowserHistory";
import Observable from "zen-observable";

/*
let observable = new Observable(observer => {
    // Emit a single value after 1 second
    let timer = setTimeout(_=> {
        observer.next("hello");
        observer.complete();
    }, 1000);

    // On unsubscription, cancel the timer
    return _=> clearTimeout(timer);
});
*/

export default function Router$({}) {
  let observable = new Observable((observer) => {
    const history = createHistory();
    observer.next(history.location);
    const unlisten = history.listen((location) => {
      observer.next(location);
    });
    return () => unlisten();
  });

  return most.from(observable).multicast();
}
