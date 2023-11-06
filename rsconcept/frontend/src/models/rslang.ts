// Module: RSLang model types

// ======== RS Parsing ============
export interface IRSExpression {
  expression: string
}

export enum Syntax {
  UNDEF = 'undefined',
  ASCII = 'ascii',
  MATH = 'math'
}

export enum ValueClass {
  INVALID = 'invalid',
  VALUE = 'value',
  PROPERTY = 'property'
}

export enum ParsingStatus {
  UNDEF = 'undefined',
  VERIFIED = 'verified',
  INCORRECT = 'incorrect'
}

export interface IRSErrorDescription {
  errorType: RSErrorType
  position: number
  isCritical: boolean
  params: string[]
}

export interface ISyntaxTreeNode {
  uid: number
  parent: number
  typeID: TokenID
  start: number
  finish: number
  data: {
    dataType: string
    value: unknown
  }
}
export type SyntaxTree = ISyntaxTreeNode[]

export interface IArgumentInfo {
  alias: string
  typification: string
}

export interface IArgumentValue extends IArgumentInfo {
  value?: string
}

export interface IExpressionParse {
  parseResult: boolean
  syntax: Syntax
  typification: string
  valueClass: ValueClass
  errors: IRSErrorDescription[]
  astText: string
  ast: SyntaxTree
  args: IArgumentInfo[]
}

//! RS language token types enumeration
export enum TokenID {
  // Global, local IDs and literals
  ID_LOCAL = 258,
  ID_GLOBAL,
  ID_FUNCTION,
  ID_PREDICATE,
  ID_RADICAL,
  LIT_INTEGER,
  LIT_INTSET,
  LIT_EMPTYSET,

  // Aithmetic
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
  FORALL,
  EXISTS,
  NOT,
  EQUIVALENT,
  IMPLICATION,
  OR,
  AND,

  // Set theory predicate symbols
  IN,
  NOTIN,
  SUBSET,
  SUBSET_OR_EQ,
  NOTSUBSET,

  // Set theory operators
  DECART,
  UNION,
  INTERSECTION,
  SET_MINUS,
  SYMMINUS,
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

  // Punctuation
  PUNC_DEFINE,
  PUNC_STRUCT,
  PUNC_ASSIGN,
  PUNC_ITERATE,
  PUNC_PL,
  PUNC_PR,
  PUNC_CL,
  PUNC_CR,
  PUNC_SL,
  PUNC_SR,
  PUNC_BAR,
  PUNC_COMMA,
  PUNC_SEMICOLON,

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

  NT_IMP_DECLARE,
  NT_IMP_ASSIGN,
  NT_IMP_LOGIC,


  // ======= Helper tokens ========
  INTERRUPT,
  END
}

export enum RSErrorType {
  unknownSymbol = 33283,
  syntax = 33792,
  missingParanthesis = 33798,
  missingCurlyBrace = 33799,
  invalidQuantifier = 33800,
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
  ivalidBinding = 34836,
  localOutOfScope = 34837,
  invalidElementPredicat = 34838,
  invalidArgsArtity = 34840,
  invalidArgumentType = 34841,
  invalidEqualsEmpty = 34842,
  globalStructure = 34844,
  globalExpectedFunction = 34847,
  emptySetUsage = 34848,
  radicalUsage = 34849,
  invalidFilterArgumentType = 34850,
  invalidFilterArity = 34851,
  arithmeticNotSupported = 34852,
  typesNotCompatible = 34853,
  orderingNotSupported = 34854,


  // !!!! Добавлены по сравнению с ConceptCore !!!!!
  globalNonemptyBase = 34855,
  globalUnexpectedType = 34856,


  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  globalNoValue = 34880,
  invalidPropertyUsage = 34881,
  globalMissingAST = 34882,
  globalFuncNoInterpretation = 34883
}

// Error handling
export enum RSErrorClass {
  LEXER,
  PARSER,
  SEMANTIC,
  UNKNOWN
}

const ERRCODE_LEXER_MASK = 512;
const ERRCODE_PARSER_MASK = 1024;
const ERRCODE_TYPE_MASK = 2048;

export function resolveErrorClass(error: RSErrorType): RSErrorClass {
  if ((error & ERRCODE_LEXER_MASK) !== 0) {
    return RSErrorClass.LEXER;
  } else if ((error & ERRCODE_PARSER_MASK) !== 0) {
    return RSErrorClass.PARSER;
  } else if ((error & ERRCODE_TYPE_MASK) !== 0) {
    return RSErrorClass.SEMANTIC;
  } else {
    return RSErrorClass.UNKNOWN;
  }
}
