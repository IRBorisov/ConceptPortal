import { useSyncExternalStore } from 'react';

import { type Constituenta, EvalStatus, type RSEngine } from '@/domain/library';

const noop: () => void = () => undefined;

/** Returns status of a constituent, or null if it is not available. */
export function useCstStatus(engine: RSEngine, cst: Constituenta | null): EvalStatus {
  return useSyncExternalStore(
    cb => (cst && engine ? engine.subscribeStatus(cst.id, cb) : noop),
    () => (cst && engine ? engine.getCstStatus(cst.id) : EvalStatus.NOT_PROCESSED)
  );
}
