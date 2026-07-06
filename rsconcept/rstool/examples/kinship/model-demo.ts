import { TUPLE_ID } from '@rsconcept/domain';

import { S1_ID, S2_ID, S3_ID, S4_ID, X1_ID } from './constants';

export const KINSHIP_X1_BINDING = {
  0: 'Иван',
  1: 'Мария',
  2: 'Пётр',
  3: 'Анна',
  4: 'Олег',
  5: 'Дарья',
  6: 'Семён'
} as const;

export const KINSHIP_S1_VALUE = [
  [TUPLE_ID, 0, 2],
  [TUPLE_ID, 1, 2],
  [TUPLE_ID, 0, 3],
  [TUPLE_ID, 1, 3],
  [TUPLE_ID, 2, 4],
  [TUPLE_ID, 3, 5],
  [TUPLE_ID, 5, 6]
] as const;

export const KINSHIP_S4_VALUE = [[TUPLE_ID, 0, 1]] as const;
export const KINSHIP_S2_VALUE = [0, 2, 4, 6] as const;
export const KINSHIP_S3_VALUE = [1, 3, 5] as const;

export const KINSHIP_MODEL_SET = [
  { target: X1_ID, value: KINSHIP_X1_BINDING },
  { target: S1_ID, value: KINSHIP_S1_VALUE },
  { target: S2_ID, value: KINSHIP_S2_VALUE },
  { target: S3_ID, value: KINSHIP_S3_VALUE },
  { target: S4_ID, value: KINSHIP_S4_VALUE }
] as const;
