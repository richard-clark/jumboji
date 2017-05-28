import * as most from "most";

export function InitialLoading$({appearanceData$}) {
  return appearanceData$
    .map(() => false)
    .startWith(true);
}

export function Loading$({initialLoading$, workerClient$}) {
  const workerLoading$ = workerClient$
    .map(({loading}) => loading)
    .startWith(false);
  const loading$ = most.combine(
    (a, b) => a || b,
    initialLoading$,
    workerLoading$
  );

  return loading$;
}
