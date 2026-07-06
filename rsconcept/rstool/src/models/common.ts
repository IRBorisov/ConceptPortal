import { CstType } from '@rsconcept/domain/library/rsform';
import { EvalStatus, type BasicBinding } from '@rsconcept/domain/library/rsmodel';
import { ValueClass } from '@rsconcept/domain/rslang';
import { RSErrorCode } from '@rsconcept/domain/rslang/error';

/** Constituent type enum (X, D, C, …). Re-exported from `@rsconcept/domain`. */
export { CstType, EvalStatus, RSErrorCode, ValueClass };
/** Named binding used in model evaluation. Re-exported from `@rsconcept/domain`. */
export type { BasicBinding };

/** Runtime evaluation value: number, nested array (set/tuple), or boolean 0/1. */
export type RSToolValue = number | RSToolValue[];
