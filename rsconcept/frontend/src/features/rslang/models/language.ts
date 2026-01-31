import { TOKEN_ERROR } from '@/utils/parsing';

/** Represents RSLang token types. */
export const TokenID = {
  // Global, local IDs and literals
  ERROR: TOKEN_ERROR,

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
