import { type BasicBinding, type EvalStatus, type RSToolValue } from './common';

/** Model value for one constituent. */
export interface ModelValueState {
  id: number;
  /** Frontend type string: `basic` or normalized effective typification. */
  type: string;
  value: RSToolValue | BasicBinding;
}

/** All model values in a session. */
export interface SessionModelState {
  items: ModelValueState[];
}

/** Set or replace the model value for one constituent. */
export interface SetConstituentaValueInput {
  /** Target constituent id. */
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

/** Input for {@link RSToolAgent.setModelValues}. */
export interface SetModelValuesInput {
  set?: SetConstituentaValueInput[];
  /** Constituent ids whose model values should be cleared. */
  clear?: number[];
}

/** Per-constituent outcome after {@link RSToolAgent.recalculateModel}. */
export interface RecalculateModelResult {
  items: Array<{ id: number; alias: string; value: RSToolValue | null; status: EvalStatus }>;
}
