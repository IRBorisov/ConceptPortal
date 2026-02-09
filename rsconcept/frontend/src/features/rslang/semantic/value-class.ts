/* Module: Calculation for RSLang. */

/** Represents computability class. */
export const ValueClass = {
  VALUE: 'value',
  PROPERTY: 'property'
} as const;
export type ValueClass = (typeof ValueClass)[keyof typeof ValueClass];

/** ValueClass context. */
export type ValueClassContext = Map<string, ValueClass>;
