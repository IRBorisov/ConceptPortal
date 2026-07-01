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

/** Language or validation error with source span and optional format parameters. */
export interface RSToolErrorDescription {
  /** Numeric error code (see {@link RSErrorCode}). */
  code: number;
  /** Start offset in the analyzed expression. */
  from: number;
  /** End offset in the analyzed expression. */
  to: number;
  /** Interpolation values for localized error messages. */
  params?: readonly string[];
}
