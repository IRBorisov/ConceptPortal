import { useSyncExternalStore } from 'react';

import { type Constituenta } from '@/features/rsform';

import { type RSEngine } from '../models/rsengine';
import { EvalStatus } from '../models/rsmodel';

const noop: () => void = () => undefined;

/** Returns status of a constituent, or null if it is not available. */
export function useCstStatus(engine: RSEngine, cst: Constituenta | null): EvalStatus {
  return useSyncExternalStore(
    cb => cst && engine ? engine.subscribeStatus(cst.id, cb) : noop,
    () => cst && engine ? engine.getCstStatus(cst.id) : EvalStatus.NOT_PROCESSED
  );
}

