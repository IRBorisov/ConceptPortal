/**
 * Module: Models for RSLanguage.
 */

import { type TokenID } from '../backend/types';

/**
 * Represents alias mapping.
 */
export type AliasMapping = Record<string, string>;

/**
 * Represents AST node.
 */
export interface ISyntaxTreeNode {
  uid: number;
  parent: number;
  typeID: TokenID;
  start: number;
  finish: number;
  data: {
    dataType: string;
    value: unknown;
  };
}

/**
 * Represents Syntax tree for RSLang expression.
 */
export type SyntaxTree = ISyntaxTreeNode[];

/**
 * Represents function argument definition.
 */
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

/**
 * Represents function argument value.
 */
export interface IArgumentValue extends IArgumentInfo {
  value?: string;
}

/** Represents error class. */
export enum RSErrorClass {
  LEXER,
  PARSER,
  SEMANTIC,
  UNKNOWN
}
