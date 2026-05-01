import { RSErrorCode } from '@/domain/rslang/error';

/**
 * RSLang type names, semantic/parser error text, type-class labels.
 */
export const rslangLid = {
  type: {
    logicName: 'labels.rslang.type.logicName'
  },
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

export const RSLANG_UI_DEFAULTS: Record<string, string> = {
  [rslangLid.type.logicName]: 'Logic',

  [rslangLid.typeClass.logic]: 'Logical',
  [rslangLid.typeClass.typification]: 'Set-theoretic',
  [rslangLid.typeClass.function]: 'Term function',
  [rslangLid.typeClass.predicate]: 'Predicate function',

  [rslangLid.misc.notDefined]: 'undefined',

  [rslangLid.fallback.unknownRSError]: 'UNKNOWN ERROR',
  [rslangLid.fallback.unknownNode]: 'UNKNOWN {id}',
  [rslangLid.fallback.noTokenLabel]: 'no label: {id}',

  [rslangLid.error[RSErrorCode.unknownSyntax]]: 'Undefined syntax error',
  [rslangLid.error[RSErrorCode.missingParenthesis]]: "Missing ')'",
  [rslangLid.error[RSErrorCode.missingCurlyBrace]]: "Missing '}'",
  [rslangLid.error[RSErrorCode.missingSquareBracket]]: "Missing ']'",
  [rslangLid.error[RSErrorCode.bracketMismatch]]: "Mismatched brackets: '{open}' instead of '{close}'",
  [rslangLid.error[RSErrorCode.doubleParenthesis]]: "Double outer parentheses '((' and '))' are not allowed",
  [rslangLid.error[RSErrorCode.missingOpenBracket]]: "Missing opening bracket '{bracket}'",
  [rslangLid.error[RSErrorCode.expectedLocal]]: 'Variable name expected',
  [rslangLid.error[RSErrorCode.expectedType]]: 'Type expected: {type}',
  [rslangLid.error[RSErrorCode.localDoubleDeclare]]: 'Duplicate declaration: {name}',
  [rslangLid.error[RSErrorCode.localNotUsed]]: 'Unused variable: {name}',
  [rslangLid.error[RSErrorCode.localUndeclared]]: 'Undeclared variable: {name}',
  [rslangLid.error[RSErrorCode.localShadowing]]: 'Variable shadowing: {name}',
  [rslangLid.error[RSErrorCode.typesNotEqual]]: 'Typifications differ: {a} ≠ {b}',
  [rslangLid.error[RSErrorCode.globalNotTyped]]: 'No typification: {name}',
  [rslangLid.error[RSErrorCode.invalidDecart]]:
    'τ(α×b) = 𝔅(𝔇τ(α)×𝔇τ(b)). Invalid argument: {arg}',
  [rslangLid.error[RSErrorCode.invalidBoolean]]:
    'τ(ℬ(a)) = 𝔅𝔅𝔇τ(a). Invalid argument: {arg}',
  [rslangLid.error[RSErrorCode.invalidTypeOperation]]: 'Operation argument must be a set: {arg}',
  [rslangLid.error[RSErrorCode.invalidCard]]: 'Cardinality only for sets: {arg}',
  [rslangLid.error[RSErrorCode.invalidDebool]]: 'τ(debool(a)) = 𝔇τ(a). Invalid argument: {arg}',
  [rslangLid.error[RSErrorCode.globalFuncWithoutArgs]]: 'Function without arguments: {name}',
  [rslangLid.error[RSErrorCode.invalidReduce]]: 'τ(red(a)) = 𝔅𝔇𝔇τ(a). Invalid argument: {arg}',
  [rslangLid.error[RSErrorCode.invalidProjectionTuple]]:
    'Projection only for a tuple: {from} → {to}',
  [rslangLid.error[RSErrorCode.invalidProjectionSet]]:
    'τ(Pri(a)) = 𝔅𝒞i𝔇τ(a). Invalid argument: {from} → {to}',
  [rslangLid.error[RSErrorCode.invalidEnumeration]]: 'Element typifications differ: {a} ≠ {b}',
  [rslangLid.error[RSErrorCode.invalidCortegeDeclare]]:
    'Tuple variable count does not match Cartesian product dimension',
  [rslangLid.error[RSErrorCode.localOutOfScope]]: 'Variable _{name}_ is outside its definition scope',
  [rslangLid.error[RSErrorCode.invalidElementPredicate]]:
    'Typification mismatch: {a}{b}{c}',
  [rslangLid.error[RSErrorCode.invalidEmptySetUsage]]: 'Meaningless use of the empty set',
  [rslangLid.error[RSErrorCode.invalidArgsArity]]: 'Wrong number of arguments: {a} ≠ {b}',
  [rslangLid.error[RSErrorCode.invalidArgumentType]]:
    'Argument typification does not match declaration: {expected} != {actual}',
  [rslangLid.error[RSErrorCode.globalStructure]]: 'Generic structure domain of definition is invalid',
  [rslangLid.error[RSErrorCode.radicalUsage]]: 'Radicals are forbidden outside declarations: {name}',
  [rslangLid.error[RSErrorCode.invalidFilterArgumentType]]:
    'Filter argument typification invalid: {a}({b})',
  [rslangLid.error[RSErrorCode.invalidFilterArity]]:
    'Filter parameter count does not match index count',
  [rslangLid.error[RSErrorCode.arithmeticNotSupported]]: 'Type does not support arithmetic: {type}',
  [rslangLid.error[RSErrorCode.typesNotCompatible]]:
    'Types are incompatible for the chosen operation: {a} and {b}',
  [rslangLid.error[RSErrorCode.orderingNotSupported]]: 'Type does not support order predicates: {type}',
  [rslangLid.error[RSErrorCode.globalNoValue]]: 'Non-computable identifier: {name}',
  [rslangLid.error[RSErrorCode.invalidPropertyUsage]]: 'Non-iterable set used as a value',
  [rslangLid.error[RSErrorCode.cstEmptyDerived]]: 'Empty expression for a complex notion or statement',
  [rslangLid.error[RSErrorCode.definitionNotAllowed]]: 'Definition is not allowed for the selected type',
  [rslangLid.error[RSErrorCode.calcUnknownError]]: 'Unknown evaluation error',
  [rslangLid.error[RSErrorCode.calculationNotSupported]]: 'Function declaration does not imply evaluation',
  [rslangLid.error[RSErrorCode.setOverflow]]: 'Element count limit exceeded: {limit}',
  [rslangLid.error[RSErrorCode.booleanBaseLimit]]: 'Powerset base limit exceeded: {limit}',
  [rslangLid.error[RSErrorCode.calcGlobalMissing]]: 'No value: {name}',
  [rslangLid.error[RSErrorCode.iterationsLimit]]: 'Iteration limit exceeded: {limit}',
  [rslangLid.error[RSErrorCode.calcInvalidDebool]]: 'Invalid debool application',
  [rslangLid.error[RSErrorCode.iterateInfinity]]: 'Iteration over infinity'
};
