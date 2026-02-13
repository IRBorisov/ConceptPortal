import { type LibraryItemData } from '@/features/library';
import { type RSCalculator } from '@/features/rslang';

import { type RSForm, type RSFormStats } from './rsform';

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
