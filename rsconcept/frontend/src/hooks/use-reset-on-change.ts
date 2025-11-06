import { useEffect, useMemo, useRef } from 'react';

export function useResetOnChange<T>(deps: T[], resetFn: () => void) {
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);
  const resetFnRef = useRef(resetFn);

  useEffect(() => {
    resetFnRef.current = resetFn;
  }, [resetFn]);

  useEffect(() => {
    resetFnRef.current();
  }, [depsKey]);
}
