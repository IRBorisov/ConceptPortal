import { type LibraryItemData } from '@/features/library';
import { type RSForm, type RSFormStats } from '@/features/rsform';
import { type RSCalculator } from '@/features/rslang';

export const TYPE_BASIC = 'basic';

/** Evaluation status enumeration. */
export const EvalStatus = {
  NO_EVAL: 1,         // не вычисляется
  NOT_PROCESSED: 2,   // Интерпретация не вычислялась
  EVAL_FAIL: 3,       // Ошибка при вычислении
  AXIOM_FALSE: 4,     // Значение аксиомы = FALSE
  EMPTY_SET: 5,       // Значение пусто
  HAS_DATA: 6         // Интерпретация вычислена и не пуста
} as const;
export type EvalStatus = (typeof EvalStatus)[keyof typeof EvalStatus];

/** Represents basic element binding. */
export type BasicBinding = Record<number, string>;

/** Represents {@link RSModel} basic sets binding. */
export type BasicsContext = Map<number, BasicBinding>;

/** Represents {@link RSModel} data. */
export interface RSModel extends LibraryItemData {
  schema: RSForm;
  basicsContext: BasicsContext;
  calculator: RSCalculator;
}

/** Represents {@link RSModel} statistics. */
export interface RSModelStats extends RSFormStats {
  count_missing_base: number;
  count_false_axioms: number;
  count_invalid_calculations: number;
  count_empty_terms: number;
}

