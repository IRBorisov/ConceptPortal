import { RSErrorCode } from '@/domain/rslang/error';

/**
 * RSLang semantic/parser error text, type-class labels.
 */
export const rslangLid = {
  typeClass: {
    logic: 'labels.rslang.typeClass.logic',
    typification: 'labels.rslang.typeClass.typification',
    function: 'labels.rslang.typeClass.function',
    predicate: 'labels.rslang.typeClass.predicate'
  },
  misc: {
    notDefined: 'labels.rslang.misc.notDefined'
  },
  fallback: {
    unknownRSError: 'labels.rslang.fallback.unknownRSError',
    unknownNode: 'labels.rslang.fallback.unknownNode',
    noTokenLabel: 'labels.rslang.fallback.noTokenLabel'
  },
  error: {
    [RSErrorCode.unknownSyntax]: 'labels.rslang.error.unknownSyntax',
    [RSErrorCode.missingParenthesis]: 'labels.rslang.error.missingParenthesis',
    [RSErrorCode.missingCurlyBrace]: 'labels.rslang.error.missingCurlyBrace',
    [RSErrorCode.missingSquareBracket]: 'labels.rslang.error.missingSquareBracket',
    [RSErrorCode.bracketMismatch]: 'labels.rslang.error.bracketMismatch',
    [RSErrorCode.doubleParenthesis]: 'labels.rslang.error.doubleParenthesis',
    [RSErrorCode.missingOpenBracket]: 'labels.rslang.error.missingOpenBracket',
    [RSErrorCode.expectedLocal]: 'labels.rslang.error.expectedLocal',
    [RSErrorCode.expectedType]: 'labels.rslang.error.expectedType',
    [RSErrorCode.localDoubleDeclare]: 'labels.rslang.error.localDoubleDeclare',
    [RSErrorCode.localNotUsed]: 'labels.rslang.error.localNotUsed',
    [RSErrorCode.localUndeclared]: 'labels.rslang.error.localUndeclared',
    [RSErrorCode.localShadowing]: 'labels.rslang.error.localShadowing',
    [RSErrorCode.typesNotEqual]: 'labels.rslang.error.typesNotEqual',
    [RSErrorCode.globalNotTyped]: 'labels.rslang.error.globalNotTyped',
    [RSErrorCode.invalidDecart]: 'labels.rslang.error.invalidDecart',
    [RSErrorCode.invalidBoolean]: 'labels.rslang.error.invalidBoolean',
    [RSErrorCode.invalidTypeOperation]: 'labels.rslang.error.invalidTypeOperation',
    [RSErrorCode.invalidCard]: 'labels.rslang.error.invalidCard',
    [RSErrorCode.invalidDebool]: 'labels.rslang.error.invalidDebool',
    [RSErrorCode.globalFuncWithoutArgs]: 'labels.rslang.error.globalFuncWithoutArgs',
    [RSErrorCode.invalidReduce]: 'labels.rslang.error.invalidReduce',
    [RSErrorCode.invalidProjectionTuple]: 'labels.rslang.error.invalidProjectionTuple',
    [RSErrorCode.invalidProjectionSet]: 'labels.rslang.error.invalidProjectionSet',
    [RSErrorCode.invalidEnumeration]: 'labels.rslang.error.invalidEnumeration',
    [RSErrorCode.invalidCortegeDeclare]: 'labels.rslang.error.invalidCortegeDeclare',
    [RSErrorCode.localOutOfScope]: 'labels.rslang.error.localOutOfScope',
    [RSErrorCode.invalidElementPredicate]: 'labels.rslang.error.invalidElementPredicate',
    [RSErrorCode.invalidEmptySetUsage]: 'labels.rslang.error.invalidEmptySetUsage',
    [RSErrorCode.invalidArgsArity]: 'labels.rslang.error.invalidArgsArity',
    [RSErrorCode.invalidArgumentType]: 'labels.rslang.error.invalidArgumentType',
    [RSErrorCode.globalStructure]: 'labels.rslang.error.globalStructure',
    [RSErrorCode.radicalUsage]: 'labels.rslang.error.radicalUsage',
    [RSErrorCode.invalidFilterArgumentType]: 'labels.rslang.error.invalidFilterArgumentType',
    [RSErrorCode.invalidFilterArity]: 'labels.rslang.error.invalidFilterArity',
    [RSErrorCode.arithmeticNotSupported]: 'labels.rslang.error.arithmeticNotSupported',
    [RSErrorCode.typesNotCompatible]: 'labels.rslang.error.typesNotCompatible',
    [RSErrorCode.orderingNotSupported]: 'labels.rslang.error.orderingNotSupported',
    [RSErrorCode.globalNoValue]: 'labels.rslang.error.globalNoValue',
    [RSErrorCode.invalidPropertyUsage]: 'labels.rslang.error.invalidPropertyUsage',
    [RSErrorCode.cstEmptyDerived]: 'labels.rslang.error.cstEmptyDerived',
    [RSErrorCode.definitionNotAllowed]: 'labels.rslang.error.definitionNotAllowed',
    [RSErrorCode.calcUnknownError]: 'labels.rslang.error.calcUnknownError',
    [RSErrorCode.calculationNotSupported]: 'labels.rslang.error.calculationNotSupported',
    [RSErrorCode.setOverflow]: 'labels.rslang.error.setOverflow',
    [RSErrorCode.booleanBaseLimit]: 'labels.rslang.error.booleanBaseLimit',
    [RSErrorCode.calcGlobalMissing]: 'labels.rslang.error.calcGlobalMissing',
    [RSErrorCode.iterationsLimit]: 'labels.rslang.error.iterationsLimit',
    [RSErrorCode.calcInvalidDebool]: 'labels.rslang.error.calcInvalidDebool',
    [RSErrorCode.iterateInfinity]: 'labels.rslang.error.iterateInfinity'
  }
} as const;
