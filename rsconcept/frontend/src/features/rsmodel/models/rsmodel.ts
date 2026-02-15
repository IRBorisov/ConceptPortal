import { type LibraryItemData } from '@/features/library';
import { type RSForm, type RSFormStats } from '@/features/rsform';
import { type RSCalculator } from '@/features/rslang';

export const TYPE_BASIC = 'basic';

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

// //! Evaluation status enumeration
// enum class EvalStatus : uint8_t {
//   UNKNOWN = 0, //
//   NEVER_CALCULATED = 1, // Интерпретация не вычислялась
//   INCALCULABLE = 2, // Невозможно вычислить
//   AXIOM_FAIL = 3, // Значение аксиомы = FALSE (только для аксиом)
//   EMPTY = 4, // Значение пусто (только для множеств)
//   HAS_DATA = 5, // Интерпретация вычислена и непуста
// };
