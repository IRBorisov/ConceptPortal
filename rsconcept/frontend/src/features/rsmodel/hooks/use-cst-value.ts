import { useSyncExternalStore } from 'react';

import { type Constituenta, type RSEngine } from '@/domain/library';
import { type Value } from '@/domain/rslang';

const noop: () => void = () => undefined;

/** Returns value of a constituent, or null if it is not available. */
export function useCstValue(engine: RSEngine, cst: Constituenta | null): Value | null {
  return useSyncExternalStore(
    cb => (cst && engine ? engine.subscribeValue(cst.id, cb) : noop),
    () => (cst && engine ? engine.getCstValue(cst.id) : null)
  );
}
