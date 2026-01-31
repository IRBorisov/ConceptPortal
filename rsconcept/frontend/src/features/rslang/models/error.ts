import { type RO } from '@/utils/meta';

import { type IRSErrorDescription } from '..';

/** Represents error class. */
export const RSErrorClass = {
  LEXER: 0,
  PARSER: 1,
  SEMANTIC: 2,
  UNKNOWN: 3
} as const;
export type RSErrorClass = (typeof RSErrorClass)[keyof typeof RSErrorClass];
export { type IRSErrorDescription } from '../../rsform/backend/types';

/** Represents RSLang expression error description. */
export interface RSErrorDescription {
  code: RSErrorCode;
  position: number;
  params?: string[];
}

/** Error reporter function type. */
export type ErrorReporter = (error: RSErrorDescription) => void;

/** Represents RSLang expression error types. */
export const RSErrorCode = {
  unknownSymbol: 0x8203,              // 33283
  syntax: 0x8400,                     // 33792
  missingParenthesis: 0x8406,         // 33798
  missingCurlyBrace: 0x8407,          // 33799
  invalidQuantifier: 0x8408,          // 33800
  invalidImperative: 0x8409,          // 33801
  expectedArgDeclaration: 0x8414,     // 33812
  expectedLocal: 0x8415,              // 33813
  expectedType: 0x8416,               // 33814

  localDoubleDeclare: 0x2801,         // 10241
  localNotUsed: 0x2802,               // 10242

  localUndeclared: 0x8801,            // 34817
  localShadowing: 0x8802,             // 34818

  typesNotEqual: 0x8803,              // 34819
  globalNotTyped: 0x8804,             // 34820
  invalidDecart: 0x8805,              // 34821
  invalidBoolean: 0x8806,             // 34822
  invalidTypeOperation: 0x8807,       // 34823
  invalidCard: 0x8808,                // 34824
  invalidDebool: 0x8809,              // 34825
  globalFuncWithoutArgs: 0x880b,      // 34827
  invalidReduce: 0x8810,              // 34832
  invalidProjectionTuple: 0x8811,     // 34833
  invalidProjectionSet: 0x8812,       // 34834
  invalidEnumeration: 0x8813,         // 34835
  invalidCortegeDeclare: 0x8814,      // 34836
  localOutOfScope: 0x8815,            // 34837
  invalidElementPredicate: 0x8816,    // 34838
  invalidEmptySetUsage: 0x8817,       // 34839
  invalidArgsArity: 0x8818,           // 34840
  invalidArgumentType: 0x8819,        // 34841
  globalStructure: 0x881c,            // 34844
  radicalUsage: 0x8821,               // 34849
  invalidFilterArgumentType: 0x8822,  // 34850
  invalidFilterArity: 0x8823,         // 34851
  arithmeticNotSupported: 0x8824,     // 34852
  typesNotCompatible: 0x8825,         // 34853
  orderingNotSupported: 0x8826,       // 34854

  globalNoValue: 0x8840,              // 34880
  invalidPropertyUsage: 0x8841,       // 34881
  globalMissingAST: 0x8842,           // 34882
  globalFuncNoInterpretation: 0x8843, // 34883

  cstNonemptyBase: 0x8860,            // 34912
  cstEmptyDerived: 0x8861,            // 34913
  cstCallableNoArgs: 0x8862,          // 34914
  cstNonCallableHasArgs: 0x8863,      // 34915
  cstExpectedLogical: 0x8864,         // 34916
  cstExpectedTyped: 0x8865            // 34917
} as const;
export type RSErrorCode = (typeof RSErrorCode)[keyof typeof RSErrorCode];

const ERROR_LEXER_MASK = 512;
const ERROR_PARSER_MASK = 1024;
const ERROR_SEMANTIC_MASK = 2048;

/** Infers error class from error type (code). */
function inferErrorClass(error: RSErrorCode): RSErrorClass {
  if ((error & ERROR_LEXER_MASK) !== 0) {
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
export function getRSErrorPrefix(error: RO<IRSErrorDescription>): string {
  const id = error.errorType.toString(16);
  // prettier-ignore
  switch (inferErrorClass(error.errorType)) {
    case RSErrorClass.LEXER: return 'L' + id;
    case RSErrorClass.PARSER: return 'P' + id;
    case RSErrorClass.SEMANTIC: return 'S' + id;
    case RSErrorClass.UNKNOWN: return 'U' + id;
  }
}

/** Checks if error is critical. */
export function isCritical(code: RSErrorCode): boolean {
  return code !== RSErrorCode.localDoubleDeclare &&
    code !== RSErrorCode.localNotUsed;
}