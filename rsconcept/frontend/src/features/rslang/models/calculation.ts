/* Module: Calculation for RSLang. */

/** Represents computability class. */
export const ValueClass = {
  INVALID: 'invalid', // incalculable
  VALUE: 'value',
  PROPERTY: 'property'
} as const;
export type ValueClass = (typeof ValueClass)[keyof typeof ValueClass];

/** ValueClass context. */
export type ValueContext = Map<string, ValueClass>;
