import { useSyncExternalStore } from 'react';

import { type Constituenta } from '@/features/rsform';
import { type Value } from '@/features/rslang';

import { type RSEngine } from '../models/rsengine';

const noop: () => void = () => undefined;

/** Returns value of a constituent, or null if it is not available. */
export function useCstValue(engine: RSEngine, cst: Constituenta | null): Value | null {
  return useSyncExternalStore(
    cb => cst && engine ? engine.subscribeValue(cst.id, cb) : noop,
    () => cst && engine ? engine.getCstValue(cst.id) : null
  );
}