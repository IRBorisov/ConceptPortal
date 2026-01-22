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

/** Represents RSLang token types. */
export const TokenID = {
  // Global, local IDs and literals
  ERROR: 0,

  ID_LOCAL: 258,
  ID_GLOBAL: 259,
  ID_FUNCTION: 260,
  ID_PREDICATE: 261,
  ID_RADICAL: 262,
  LIT_INTEGER: 263,
  LIT_WHOLE_NUMBERS: 264,
  LIT_EMPTYSET: 265,

  // Arithmetic
  PLUS: 266,
  MINUS: 267,
  MULTIPLY: 268,

  // Integer predicate symbols
  GREATER: 269,
  LESSER: 270,
  GREATER_OR_EQ: 271,
  LESSER_OR_EQ: 272,

  // Equality comparison
  EQUAL: 273,
  NOTEQUAL: 274,

  // Logic predicate symbols
  QUANTOR_UNIVERSAL: 275,
  QUANTOR_EXISTS: 276,
  LOGIC_NOT: 277,
  LOGIC_EQUIVALENT: 278,
  LOGIC_IMPLICATION: 279,
  LOGIC_OR: 280,
  LOGIC_AND: 281,

  // Set theory predicate symbols
  SET_IN: 282,
  SET_NOT_IN: 283,
  SUBSET: 284,
  SUBSET_OR_EQ: 285,
  NOT_SUBSET: 286,

  // Set theory operators
  DECART: 287,
  SET_UNION: 288,
  SET_INTERSECTION: 289,
  SET_MINUS: 290,
  SET_SYMMETRIC_MINUS: 291,
  BOOLEAN: 292,

  // Structure operations
  BIGPR: 293,
  SMALLPR: 294,
  FILTER: 295,
  CARD: 296,
  BOOL: 297,
  DEBOOL: 298,
  REDUCE: 299,

  // Term constructions prefixes
  DECLARATIVE: 300,
  RECURSIVE: 301,
  IMPERATIVE: 302,

  ITERATE: 303,
  ASSIGN: 304,

  // Punctuation
  PUNCTUATION_DEFINE: 305,
  PUNCTUATION_STRUCT: 306,
  PUNCTUATION_PL: 307,
  PUNCTUATION_PR: 308,
  PUNCTUATION_CL: 309,
  PUNCTUATION_CR: 310,
  PUNCTUATION_SL: 311,
  PUNCTUATION_SR: 312,
  PUNCTUATION_BAR: 313,
  PUNCTUATION_COMMA: 314,
  PUNCTUATION_SEMICOLON: 315,

  // ======= Non-terminal tokens =========
  NT_ENUM_DECL: 316,
  NT_TUPLE: 317,
  NT_ENUMERATION: 318,
  NT_TUPLE_DECL: 319,
  NT_ARG_DECL: 320,

  NT_FUNC_DEFINITION: 321,
  NT_ARGUMENTS: 322,
  NT_FUNC_CALL: 323,

  NT_DECLARATIVE_EXPR: 324,
  NT_IMPERATIVE_EXPR: 325,
  NT_RECURSIVE_FULL: 326,
  NT_RECURSIVE_SHORT: 327,

  // ======= Helper tokens ========
  INTERRUPT: 328,
  END: 329
} as const;
export type TokenID = (typeof TokenID)[keyof typeof TokenID];

/** Represents RSLang expression error types. */
export const RSErrorType = {
  unknownSymbol: 33283,
  syntax: 33792,
  missingParenthesis: 33798,
  missingCurlyBrace: 33799,
  invalidQuantifier: 33800,
  invalidImperative: 33801,
  expectedArgDeclaration: 33812,
  expectedLocal: 33813,
  localDoubleDeclare: 10241,
  localNotUsed: 10242,

  localUndeclared: 34817,
  localShadowing: 34818,

  typesNotEqual: 34819,
  globalNotTyped: 34820,
  invalidDecart: 34821,
  invalidBoolean: 34822,
  invalidTypeOperation: 34823,
  invalidCard: 34824,
  invalidDebool: 34825,
  globalFuncMissing: 34826,
  globalFuncWithoutArgs: 34827,
  invalidReduce: 34832,
  invalidProjectionTuple: 34833,
  invalidProjectionSet: 34834,
  invalidEnumeration: 34835,
  invalidBinding: 34836,
  localOutOfScope: 34837,
  invalidElementPredicate: 34838,
  invalidEmptySetUsage: 34839,
  invalidArgsArity: 34840,
  invalidArgumentType: 34841,
  globalStructure: 34844,
  radicalUsage: 34849,
  invalidFilterArgumentType: 34850,
  invalidFilterArity: 34851,
  arithmeticNotSupported: 34852,
  typesNotCompatible: 34853,
  orderingNotSupported: 34854,

  globalNoValue: 34880,
  invalidPropertyUsage: 34881,
  globalMissingAST: 34882,
  globalFuncNoInterpretation: 34883,

  cstNonemptyBase: 34912,
  cstEmptyDerived: 34913,
  cstCallableNoArgs: 34914,
  cstNonCallableHasArgs: 34915,
  cstExpectedLogical: 34916,
  cstExpectedTyped: 34917
} as const;
export type RSErrorType = (typeof RSErrorType)[keyof typeof RSErrorType];