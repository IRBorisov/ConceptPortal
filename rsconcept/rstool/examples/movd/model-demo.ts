import { TUPLE_ID } from '@rsconcept/domain';

import { S1_ID, S2_ID, S3_ID, S4_ID, X1_ID, X2_ID, X3_ID, X4_ID } from './constants';

export const MOVD_X1_BINDING = { 0: 'переговоры' } as const;
export const MOVD_X2_BINDING = { 0: 'стол', 1: 'дверь' } as const;
export const MOVD_X3_BINDING = { 0: 'Алиса' } as const;
export const MOVD_X4_BINDING = { 0: 'выйти', 1: 'остаться' } as const;

export const MOVD_S1_VALUE = [
  [TUPLE_ID, 0, 0],
  [TUPLE_ID, 0, 1]
] as const;

export const MOVD_S2_VALUE = [[TUPLE_ID, 0, 0, 0]] as const;
export const MOVD_S3_VALUE = [
  [TUPLE_ID, 0, 0, 0],
  [TUPLE_ID, 0, 0, 1]
] as const;
export const MOVD_S4_VALUE = [[TUPLE_ID, 0, 0, 0]] as const;

export const MOVD_MODEL_SET = [
  { target: X1_ID, value: MOVD_X1_BINDING },
  { target: X2_ID, value: MOVD_X2_BINDING },
  { target: X3_ID, value: MOVD_X3_BINDING },
  { target: X4_ID, value: MOVD_X4_BINDING },
  { target: S1_ID, value: MOVD_S1_VALUE },
  { target: S2_ID, value: MOVD_S2_VALUE },
  { target: S3_ID, value: MOVD_S3_VALUE },
  { target: S4_ID, value: MOVD_S4_VALUE }
] as const;
