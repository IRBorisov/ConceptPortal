import { TUPLE_ID } from '@rsconcept/domain';

import { S1_ID, S2_ID } from './constants';

export const CHOCOLATE_S1_VALUE = [TUPLE_ID, 4, 6] as const;
export const CHOCOLATE_S2_VALUE = [TUPLE_ID, 2, 3] as const;

export const CHOCOLATE_MODEL_SET = [
  { target: S1_ID, value: CHOCOLATE_S1_VALUE },
  { target: S2_ID, value: CHOCOLATE_S2_VALUE }
] as const;
