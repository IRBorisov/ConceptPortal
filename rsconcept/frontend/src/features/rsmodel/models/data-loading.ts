import { toast } from 'react-toastify';

import { type BasicBinding } from '@/domain/library';
import { toBasicBinding, validateBasicBindingData, validateValueData } from '@/domain/library/rsmodel-api';
import { type Value } from '@/domain/rslang';
import { normalizeValue } from '@/domain/rslang/eval/value-api';
import { globalTx } from '@/i18n';

/** Process binding data from string. */
export function processBindingData(data: string): BasicBinding | null {
  try {
    const value = JSON.parse(data) as unknown;
    if (validateBasicBindingData(value)) {
      return toBasicBinding(value);
    } else {
      toast.error(globalTx('tx.rslang.binding.load.validate'));
    }
  } catch (error) {
    toast.error((error as Error).message);
    console.error(error);
  }
  return null;
}

/** Process value data from string. */
export function processValueData(data: string): Value | null {
  try {
    const value = JSON.parse(data) as unknown;
    if (validateValueData(value)) {
      normalizeValue(value);
      return value;
    } else {
      toast.error(globalTx('tx.rslang.value.load.validate'));
    }
  } catch (error) {
    toast.error((error as Error).message);
    console.error(error);
  }
  return null;
}
