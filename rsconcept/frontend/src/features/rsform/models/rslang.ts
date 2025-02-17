/**
 * Module: Models for RSLanguage.
 */

/**
 * Represents alias mapping.
 */
export type AliasMapping = Record<string, string>;

/**
 * Represents syntax type.
 */
export enum Syntax {
  UNDEF = 'undefined',
  ASCII = 'ascii',
  MATH = 'math'
}

/**
 * Represents computability class.
 */
export enum ValueClass {
  INVALID = 'invalid', // incalculable
  VALUE = 'value',
  PROPERTY = 'property'
}

/**
 * Represents parsing status.
 */
export enum ParsingStatus {
  UNDEF = 'undefined',
  VERIFIED = 'verified',
  INCORRECT = 'incorrect'
}

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

/**
 * Represents RSLang token types.
 */
export enum TokenID {
  // Global, local IDs and literals
  ID_LOCAL = 258,
  ID_GLOBAL,
  ID_FUNCTION,
  ID_PREDICATE,
  ID_RADICAL,
  LIT_INTEGER,
  LIT_WHOLE_NUMBERS,
  LIT_EMPTYSET,

  // Arithmetic
  PLUS,
  MINUS,
  MULTIPLY,

  // Integer predicate symbols
  GREATER,
  LESSER,
  GREATER_OR_EQ,
  LESSER_OR_EQ,

  // Equality comparison
  EQUAL,
  NOTEQUAL,

  // Logic predicate symbols
  QUANTOR_UNIVERSAL,
  QUANTOR_EXISTS,
  LOGIC_NOT,
  LOGIC_EQUIVALENT,
  LOGIC_IMPLICATION,
  LOGIC_OR,
  LOGIC_AND,

  // Set theory predicate symbols
  SET_IN,
  SET_NOT_IN,
  SUBSET,
  SUBSET_OR_EQ,
  NOT_SUBSET,

  // Set theory operators
  DECART,
  SET_UNION,
  SET_INTERSECTION,
  SET_MINUS,
  SET_SYMMETRIC_MINUS,
  BOOLEAN,

  // Structure operations
  BIGPR,
  SMALLPR,
  FILTER,
  CARD,
  BOOL,
  DEBOOL,
  REDUCE,

  // Term constructions prefixes
  DECLARATIVE,
  RECURSIVE,
  IMPERATIVE,

  ITERATE,
  ASSIGN,

  // Punctuation
  PUNCTUATION_DEFINE,
  PUNCTUATION_STRUCT,
  PUNCTUATION_PL,
  PUNCTUATION_PR,
  PUNCTUATION_CL,
  PUNCTUATION_CR,
  PUNCTUATION_SL,
  PUNCTUATION_SR,
  PUNCTUATION_BAR,
  PUNCTUATION_COMMA,
  PUNCTUATION_SEMICOLON,

  // ======= Non-terminal tokens =========
  NT_ENUM_DECL,
  NT_TUPLE,
  NT_ENUMERATION,
  NT_TUPLE_DECL,
  NT_ARG_DECL,

  NT_FUNC_DEFINITION,
  NT_ARGUMENTS,
  NT_FUNC_CALL,

  NT_DECLARATIVE_EXPR,
  NT_IMPERATIVE_EXPR,
  NT_RECURSIVE_FULL,
  NT_RECURSIVE_SHORT,

  // ======= Helper tokens ========
  INTERRUPT,
  END
}

/**
 * Represents RSLang expression error types.
 */
export enum RSErrorType {
  unknownSymbol = 33283,
  syntax = 33792,
  missingParenthesis = 33798,
  missingCurlyBrace = 33799,
  invalidQuantifier = 33800,
  invalidImperative = 33801,
  expectedArgDeclaration = 33812,
  expectedLocal = 33813,
  localDoubleDeclare = 10241,
  localNotUsed = 10242,

  localUndeclared = 34817,
  localShadowing = 34818,

  typesNotEqual = 34819,
  globalNotTyped = 34820,
  invalidDecart = 34821,
  invalidBoolean = 34822,
  invalidTypeOperation = 34823,
  invalidCard = 34824,
  invalidDebool = 34825,
  globalFuncMissing = 34826,
  globalFuncWithoutArgs = 34827,
  invalidReduce = 34832,
  invalidProjectionTuple = 34833,
  invalidProjectionSet = 34834,
  invalidEnumeration = 34835,
  invalidBinding = 34836,
  localOutOfScope = 34837,
  invalidElementPredicate = 34838,
  invalidEmptySetUsage = 34839,
  invalidArgsArity = 34840,
  invalidArgumentType = 34841,
  globalStructure = 34844,
  radicalUsage = 34849,
  invalidFilterArgumentType = 34850,
  invalidFilterArity = 34851,
  arithmeticNotSupported = 34852,
  typesNotCompatible = 34853,
  orderingNotSupported = 34854,

  globalNoValue = 34880,
  invalidPropertyUsage = 34881,
  globalMissingAST = 34882,
  globalFuncNoInterpretation = 34883,

  cstNonemptyBase = 34912,
  cstEmptyDerived = 34913,
  cstCallableNoArgs = 34914,
  cstNonCallableHasArgs = 34915,
  cstExpectedLogical = 34916,
  cstExpectedTyped = 34917
}

/**
 * Represents error class.
 */
export enum RSErrorClass {
  LEXER,
  PARSER,
  SEMANTIC,
  UNKNOWN
}
