/**
 * Module: Models for RSLanguage.
 */

/** Represents alias mapping. */
export type AliasMapping = Record<string, string>;

/** Represents function argument definition. */
export interface IArgumentInfo {
  alias: string;
  typification: string;
}

/** Represents global identifier type info. */
export interface ITypeInfo {
  alias: string;
  result: string;
  args: IArgumentInfo[];
}

/** Represents function argument value. */
export interface IArgumentValue extends IArgumentInfo {
  value?: string;
}

/** Represents error class. */
export const RSErrorClass = {
  LEXER: 0,
  PARSER: 1,
  SEMANTIC: 2,
  UNKNOWN: 3
} as const;
export type RSErrorClass = (typeof RSErrorClass)[keyof typeof RSErrorClass];
