import { useEffect, useEffectEvent, useMemo } from 'react';

export function useResetOnChange<T>(deps: T[], resetFn: () => void) {
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);
  const onResetEvent = useEffectEvent(resetFn);
  useEffect(
    function resetOnChange() {
      onResetEvent();
    },
    [depsKey]
  );
}
