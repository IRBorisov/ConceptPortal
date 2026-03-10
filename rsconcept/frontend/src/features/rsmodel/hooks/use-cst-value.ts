import { useSyncExternalStore } from 'react';

import { type Constituenta } from '@/features/rsform';
import { type Value } from '@/features/rslang';

import { type RSModel } from '../models/rsmodel';

const noop: () => void = () => undefined;

export function useCstValue(model: RSModel, cst: Constituenta | null): Value | null {
  return useSyncExternalStore(
    (cb) => cst ? model.calculator.subscribe(cst.alias, cb) : noop,
    () => cst ? model.calculator.getValue(cst.alias) : null
  );
}