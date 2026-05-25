import { CstType } from '@/domain/library/rsform';
import { EvalStatus, type BasicBinding } from '@/domain/library/rsmodel';
import { ValueClass } from '@/domain/rslang';
import { RSErrorCode } from '@/domain/rslang/error';

export { CstType, EvalStatus, RSErrorCode, ValueClass };
export type { BasicBinding };

/** Runtime evaluation value: number, nested array (set/tuple), or boolean 0/1. */
export type RSToolValue = number | RSToolValue[];

export interface RSToolErrorDescription {
  code: number;
  from: number;
  to: number;
  params?: readonly string[];
}
