import { useEffect, useMemo } from 'react';

export function useResetOnChange<T>(deps: T[], resetFn: () => void) {
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    resetFn();
  }, [depsKey, resetFn]);
}
