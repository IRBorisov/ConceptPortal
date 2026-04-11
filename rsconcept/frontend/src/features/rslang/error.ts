/** Module: Error types and functions. */

/** Represents error class. */
export const RSErrorClass = {
  LEXER: 0,
  PARSER: 1,
  SEMANTIC: 2,
  EVALUATION: 3,
  UNKNOWN: 4
} as const;
export type RSErrorClass = (typeof RSErrorClass)[keyof typeof RSErrorClass];

/** Represents RSLang expression error information. */
export interface RSErrorInfo {
  code: RSErrorCode;
  params?: readonly string[];
}

/** Represents RSLang expression error description. */
export interface RSErrorDescription extends RSErrorInfo {
  from: number;
  to: number;
}

/** Error reporter function type. */
export type ErrorReporter = (error: RSErrorDescription) => void;

/** Represents RSLang expression error types. */
export const RSErrorCode = {
  syntax: 0x8400, // 33792
  missingParenthesis: 0x8406, // 33798
  missingCurlyBrace: 0x8407, // 33799
  expectedLocal: 0x8415, // 33813
  expectedType: 0x8416, // 33814

  localDoubleDeclare: 0x2801, // 10241
  localNotUsed: 0x2802, // 10242

  localUndeclared: 0x8801, // 34817
  localShadowing: 0x8802, // 34818

  typesNotEqual: 0x8803, // 34819
  globalNotTyped: 0x8804, // 34820
  invalidDecart: 0x8805, // 34821
  invalidBoolean: 0x8806, // 34822
  invalidTypeOperation: 0x8807, // 34823
  invalidCard: 0x8808, // 34824
  invalidDebool: 0x8809, // 34825
  globalFuncWithoutArgs: 0x880b, // 34827
  invalidReduce: 0x8810, // 34832
  invalidProjectionTuple: 0x8811, // 34833
  invalidProjectionSet: 0x8812, // 34834
  invalidEnumeration: 0x8813, // 34835
  invalidCortegeDeclare: 0x8814, // 34836
  localOutOfScope: 0x8815, // 34837
  invalidElementPredicate: 0x8816, // 34838
  invalidEmptySetUsage: 0x8817, // 34839
  invalidArgsArity: 0x8818, // 34840
  invalidArgumentType: 0x8819, // 34841
  globalStructure: 0x881c, // 34844
  radicalUsage: 0x8821, // 34849
  invalidFilterArgumentType: 0x8822, // 34850
  invalidFilterArity: 0x8823, // 34851
  arithmeticNotSupported: 0x8824, // 34852
  typesNotCompatible: 0x8825, // 34853
  orderingNotSupported: 0x8826, // 34854

  globalNoValue: 0x8840, // 34880
  invalidPropertyUsage: 0x8841, // 34881

  // Value evaluation (runtime)
  calcUnknownError: 0x8100, // 35328
  setOverflow: 0x8101, // 35329
  booleanBaseLimit: 0x8102, // 35330
  calcGlobalMissing: 0x8103, // 35331
  iterationsLimit: 0x8104, // 35332
  calcInvalidDebool: 0x8105, // 35333
  iterateInfinity: 0x8106, // 35334
  calculationNotSupported: 0x8107, // 35335

  cstEmptyDerived: 0x8861 // 34913
} as const;
export type RSErrorCode = (typeof RSErrorCode)[keyof typeof RSErrorCode];

const ERROR_EVALUATION_MASK = 0x0100;
const ERROR_LEXER_MASK = 0x0200;
const ERROR_PARSER_MASK = 0x0400;
const ERROR_SEMANTIC_MASK = 0x0800;

/** Infers error class from error type (code). */
function inferErrorClass(error: RSErrorCode): RSErrorClass {
  if ((error & ERROR_EVALUATION_MASK) !== 0) {
    return RSErrorClass.EVALUATION;
  } else if ((error & ERROR_LEXER_MASK) !== 0) {
    return RSErrorClass.LEXER;
  } else if ((error & ERROR_PARSER_MASK) !== 0) {
    return RSErrorClass.PARSER;
  } else if ((error & ERROR_SEMANTIC_MASK) !== 0) {
    return RSErrorClass.SEMANTIC;
  } else {
    return RSErrorClass.UNKNOWN;
  }
}

/** Generate ErrorID label. */
export function getRSErrorPrefix(code: RSErrorCode): string {
  const id = code.toString(16).toUpperCase();
  // prettier-ignore
  switch (inferErrorClass(code)) {
    case RSErrorClass.LEXER: return 'L' + id;
    case RSErrorClass.PARSER: return 'P' + id;
    case RSErrorClass.SEMANTIC: return 'S' + id;
    case RSErrorClass.EVALUATION: return 'E' + id;
    case RSErrorClass.UNKNOWN: return 'U' + id;
  }
}

/** Checks if error is critical. */
export function isCritical(code: RSErrorCode): boolean {
  return code !== RSErrorCode.localDoubleDeclare && code !== RSErrorCode.localNotUsed;
}

/** Returns a normalized editor range for an error. */
export function getRSErrorRange(error: RSErrorDescription): { from: number; to: number } {
  const from = Math.max(error.from, 0);
  const to = typeof error.to === 'number' ? Math.max(error.to, from) : from;
  return {
    from,
    to: to > from ? to : from + 1
  };
}
