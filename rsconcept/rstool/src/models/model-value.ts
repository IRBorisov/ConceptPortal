import { type BasicBinding, type EvalStatus, type RSToolValue } from './common';

export interface ModelValueState {
  id: number;
  /** Frontend type string: `basic` or normalized effective typification. */
  type: string;
  value: RSToolValue | BasicBinding;
}

export interface SessionModelState {
  items: ModelValueState[];
}

export interface SetConstituentaValueInput {
  target: number;
  /** Optional type override; inferred from schema when omitted. */
  type?: string;
  value: RSToolValue | BasicBinding;
}

export interface SetConstituentaValuesInput {
  items: SetConstituentaValueInput[];
}

export interface ClearConstituentaValuesInput {
  items: number[];
}

export interface RecalculateModelResult {
  items: Array<{ id: number; alias: string; value: RSToolValue | null; status: EvalStatus }>;
}
