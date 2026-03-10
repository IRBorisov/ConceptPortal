import { useSyncExternalStore } from 'react';

import { type Constituenta } from '@/features/rsform';
import { type Value } from '@/features/rslang';

import { type RSModel } from '../models/rsmodel';

export function useCstValue(model: RSModel, cst: Constituenta): Value | null {
  return useSyncExternalStore(
    (cb) => model.calculator.subscribe(cst.alias, cb),
    () => model.calculator.getValue(cst.alias)
  );
}