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
