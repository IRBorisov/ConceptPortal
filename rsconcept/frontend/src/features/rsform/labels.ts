/**
 * Generates description for {@link Constituenta}.
 */

import { globalTx } from '@/i18n';
import { type Constituenta, CstClass, CstStatus, CstType } from '@rsconcept/domain/library';
import { RSErrorCode, TokenID, TypeClass } from '@rsconcept/domain/rslang';

import { prepareTooltip } from '@/utils/format';

import { type InteractionMode, type TGColoring, type TGEdgeType } from './stores/term-graph';

const RSLANG_ERROR_MESSAGE_ID: Record<RSErrorCode, string> = {
  [RSErrorCode.unknownSyntax]: 'tx.rslang.error.unknownSyntax',
  [RSErrorCode.forbiddenCharacter]: 'tx.rslang.error.forbiddenCharacter',
  [RSErrorCode.bracketMismatch]: 'tx.rslang.error.bracketMismatch',
  [RSErrorCode.doubleParenthesis]: 'tx.rslang.error.doubleParenthesis',
  [RSErrorCode.missingOpenBracket]: 'tx.rslang.error.missingOpenBracket',
  [RSErrorCode.missingCloseBracket]: 'tx.rslang.error.missingCloseBracket',
  [RSErrorCode.invalidFilterSyntax]: 'tx.rslang.error.invalidFilterSyntax',
  [RSErrorCode.expectedFunctionBody]: 'tx.rslang.error.expectedFunctionBody',
  [RSErrorCode.expectedExpressionBody]: 'tx.rslang.error.expectedExpressionBody',
  [RSErrorCode.expectedLogicBody]: 'tx.rslang.error.expectedLogicBody',
  [RSErrorCode.expectedQuantifierBody]: 'tx.rslang.error.expectedQuantifierBody',
  [RSErrorCode.expectedDeclarativeBody]: 'tx.rslang.error.expectedDeclarativeBody',
  [RSErrorCode.expectedImperativeBody]: 'tx.rslang.error.expectedImperativeBody',
  [RSErrorCode.expectedRecursiveBody]: 'tx.rslang.error.expectedRecursiveBody',
  [RSErrorCode.expectedLocal]: 'tx.rslang.error.expectedLocal',
  [RSErrorCode.expectedType]: 'tx.rslang.error.expectedType',
  [RSErrorCode.localDoubleDeclare]: 'tx.rslang.error.localDoubleDeclare',
  [RSErrorCode.localNotUsed]: 'tx.rslang.error.localNotUsed',
  [RSErrorCode.localUndeclared]: 'tx.rslang.error.localUndeclared',
  [RSErrorCode.localShadowing]: 'tx.rslang.error.localShadowing',
  [RSErrorCode.typesNotEqual]: 'tx.rslang.error.typesNotEqual',
  [RSErrorCode.globalNotTyped]: 'tx.rslang.error.globalNotTyped',
  [RSErrorCode.invalidDecart]: 'tx.rslang.error.invalidDecart',
  [RSErrorCode.invalidBoolean]: 'tx.rslang.error.invalidBoolean',
  [RSErrorCode.invalidTypeOperation]: 'tx.rslang.error.invalidTypeOperation',
  [RSErrorCode.invalidCard]: 'tx.rslang.error.invalidCard',
  [RSErrorCode.invalidDebool]: 'tx.rslang.error.invalidDebool',
  [RSErrorCode.globalFuncWithoutArgs]: 'tx.rslang.error.globalFuncWithoutArgs',
  [RSErrorCode.invalidReduce]: 'tx.rslang.error.invalidReduce',
  [RSErrorCode.projectionSetArgumentNotSet]: 'tx.rslang.error.projectionSetArgumentNotSet',
  [RSErrorCode.projectionSetArgumentNotTupleSet]: 'tx.rslang.error.projectionSetArgumentNotTupleSet',
  [RSErrorCode.projectionSetIndexOutOfRange]: 'tx.rslang.error.projectionSetIndexOutOfRange',
  [RSErrorCode.projectionTupleArgumentNotTuple]: 'tx.rslang.error.projectionTupleArgumentNotTuple',
  [RSErrorCode.projectionTupleIndexOutOfRange]: 'tx.rslang.error.projectionTupleIndexOutOfRange',
  [RSErrorCode.invalidEnumeration]: 'tx.rslang.error.invalidEnumeration',
  [RSErrorCode.invalidCortegeDeclare]: 'tx.rslang.error.invalidCortegeDeclare',
  [RSErrorCode.localOutOfScope]: 'tx.rslang.error.localOutOfScope',
  [RSErrorCode.localOutOfScopeParentheses]: 'tx.rslang.error.localOutOfScopeParentheses',
  [RSErrorCode.localUndeclaredInSubexpr]: 'tx.rslang.error.localUndeclaredInSubexpr',
  [RSErrorCode.invalidElementPredicate]: 'tx.rslang.error.invalidElementPredicate',
  [RSErrorCode.invalidEmptySetUsage]: 'tx.rslang.error.invalidEmptySetUsage',
  [RSErrorCode.invalidArgsArity]: 'tx.rslang.error.invalidArgsArity',
  [RSErrorCode.invalidArgumentType]: 'tx.rslang.error.invalidArgumentType',
  [RSErrorCode.globalStructure]: 'tx.rslang.error.globalStructure',
  [RSErrorCode.radicalUsage]: 'tx.rslang.error.radicalUsage',
  [RSErrorCode.invalidFilterArgumentType]: 'tx.rslang.error.invalidFilterArgumentType',
  [RSErrorCode.invalidFilterArity]: 'tx.rslang.error.invalidFilterArity',
  [RSErrorCode.invalidFilterParameterType]: 'tx.rslang.error.invalidFilterParameterType',
  [RSErrorCode.invalidFilterIndex]: 'tx.rslang.error.invalidFilterIndex',
  [RSErrorCode.invalidFilterBooleanEchelon]: 'tx.rslang.error.invalidFilterBooleanEchelon',
  [RSErrorCode.arithmeticNotSupported]: 'tx.rslang.error.arithmeticNotSupported',
  [RSErrorCode.typesNotCompatible]: 'tx.rslang.error.typesNotCompatible',
  [RSErrorCode.orderingNotSupported]: 'tx.rslang.error.orderingNotSupported',
  [RSErrorCode.expectedLogic]: 'tx.rslang.error.expectedLogic',
  [RSErrorCode.expectedSetexpr]: 'tx.rslang.error.expectedSetexpr',
  [RSErrorCode.invalidArgumentCortegeDeclare]: 'tx.rslang.error.invalidArgumentCortegeDeclare',
  [RSErrorCode.invalidQuantifierDomain]: 'tx.rslang.error.invalidQuantifierDomain',
  [RSErrorCode.globalNoValue]: 'tx.rslang.error.globalNoValue',
  [RSErrorCode.invalidPropertyUsage]: 'tx.rslang.error.invalidPropertyUsage',
  [RSErrorCode.cstEmptyDerived]: 'tx.rslang.error.cstEmptyDerived',
  [RSErrorCode.definitionNotAllowed]: 'tx.rslang.error.definitionNotAllowed',
  [RSErrorCode.calcUnknownError]: 'tx.rslang.error.calcUnknownError',
  [RSErrorCode.calculationNotSupported]: 'tx.rslang.error.calculationNotSupported',
  [RSErrorCode.setOverflow]: 'tx.rslang.error.setOverflow',
  [RSErrorCode.booleanBaseLimit]: 'tx.rslang.error.booleanBaseLimit',
  [RSErrorCode.calcGlobalMissing]: 'tx.rslang.error.calcGlobalMissing',
  [RSErrorCode.iterationsLimit]: 'tx.rslang.error.iterationsLimit',
  [RSErrorCode.calcInvalidDebool]: 'tx.rslang.error.calcInvalidDebool',
  [RSErrorCode.calcInvalidData]: 'tx.rslang.error.calcInvalidData',
  [RSErrorCode.iterateInfinity]: 'tx.rslang.error.iterateInfinity'
};

const TYPE_CLASS_LID: Record<TypeClass, string> = {
  [TypeClass.logic]: 'tx.rsexpression.class.logic',
  [TypeClass.typification]: 'tx.rsexpression.class.typification',
  [TypeClass.function]: 'tx.rsexpression.class.function',
  [TypeClass.predicate]: 'tx.rsexpression.class.predicate'
};

const CST_TYPE_LID: Record<CstType, string> = {
  [CstType.NOMINAL]: 'tx.cst.type.nominal',
  [CstType.BASE]: 'tx.cst.type.basic',
  [CstType.CONSTANT]: 'tx.cst.type.constant',
  [CstType.STRUCTURED]: 'tx.cst.type.structure',
  [CstType.AXIOM]: 'tx.cst.type.axiom',
  [CstType.TERM]: 'tx.cst.type.term',
  [CstType.FUNCTION]: 'tx.cst.type.function',
  [CstType.PREDICATE]: 'tx.cst.type.predicate',
  [CstType.STATEMENT]: 'tx.cst.type.statement'
};

const CST_CLASS_LABEL_LID: Record<CstClass, string> = {
  [CstClass.NOMINAL]: 'tx.cst.class.nominal.short',
  [CstClass.BASIC]: 'tx.cst.class.basic.short',
  [CstClass.DERIVED]: 'tx.cst.class.derived.short',
  [CstClass.STATEMENT]: 'tx.cst.class.statement.short',
  [CstClass.TEMPLATE]: 'tx.cst.class.template.short'
};

const CST_CLASS_DESC_LID: Record<CstClass, string> = {
  [CstClass.NOMINAL]: 'tx.cst.class.nominal',
  [CstClass.BASIC]: 'tx.cst.class.basic',
  [CstClass.DERIVED]: 'tx.cst.class.derived',
  [CstClass.STATEMENT]: 'tx.cst.class.statement',
  [CstClass.TEMPLATE]: 'tx.cst.class.template'
};

const GRAPH_MODE_LID: Record<InteractionMode, string> = {
  explore: 'tx.termGraph.mode.explore',
  edit: 'tx.termGraph.mode.edit'
};

const COLORING_LID: Record<TGColoring, string> = {
  none: 'tx.termGraph.coloring.none',
  status: 'tx.termGraph.coloring.status',
  type: 'tx.termGraph.coloring.type',
  schemas: 'tx.termGraph.coloring.schemas'
};

const EDGE_TYPE_LID: Record<TGEdgeType, string> = {
  full: 'tx.termGraph.edgeType.full',
  definition: 'tx.termGraph.edgeType.definition',
  attribution: 'tx.termGraph.edgeType.attribution'
};

const EXPR_STATUS_LID: Record<CstStatus, string> = {
  [CstStatus.VERIFIED]: 'tx.parse.status.verified',
  [CstStatus.INCORRECT]: 'tx.parse.status.incorrect',
  [CstStatus.INCALCULABLE]: 'tx.parse.status.incalculable',
  [CstStatus.PROPERTY]: 'tx.parse.status.property',
  [CstStatus.UNKNOWN]: 'tx.parse.status.unknown'
};

const EXPR_STATUS_DESC_LID: Record<CstStatus, string> = {
  [CstStatus.VERIFIED]: 'tx.parse.status.verified.hint',
  [CstStatus.INCORRECT]: 'tx.parse.status.incorrect.hint',
  [CstStatus.INCALCULABLE]: 'tx.parse.status.incalculable.hint',
  [CstStatus.PROPERTY]: 'tx.parse.status.property.hint',
  [CstStatus.UNKNOWN]: 'tx.parse.status.unknown.hint'
};

const RS_EXPRESSION_LID: Record<CstType, string> = {
  [CstType.NOMINAL]: 'tx.lib.defineFormal.nominal',
  [CstType.BASE]: 'tx.lib.defineFormal',
  [CstType.CONSTANT]: 'tx.lib.defineFormal',
  [CstType.STRUCTURED]: 'tx.lib.defineFormal.structure',
  [CstType.TERM]: 'tx.lib.defineFormal',
  [CstType.STATEMENT]: 'tx.lib.defineFormal',
  [CstType.AXIOM]: 'tx.lib.defineFormal',
  [CstType.FUNCTION]: 'tx.lib.defineFormal.function',
  [CstType.PREDICATE]: 'tx.lib.defineFormal.function'
};

const RS_PLACEHOLDER_EXAMPLE: Record<CstType, string> = {
  [CstType.NOMINAL]: '',
  [CstType.BASE]: '',
  [CstType.CONSTANT]: '',
  [CstType.STRUCTURED]: 'ℬ(X1×D2)',
  [CstType.TERM]: 'D{ξ∈S1 | Pr1(ξ)∩Pr2(ξ)=∅}',
  [CstType.STATEMENT]: 'D11=∅',
  [CstType.AXIOM]: 'D11=∅',
  [CstType.FUNCTION]: '[α∈X1, β∈ℬ(X1×X2)] Pr2(Fi1[{α}](β))',
  [CstType.PREDICATE]: '[α∈X1, β∈ℬ(X1)] α∈β & card(β)>1'
};

const cstTypeShortcutKeyRecord: Record<CstType, string> = {
  [CstType.BASE]: '1',
  [CstType.STRUCTURED]: '2',
  [CstType.TERM]: '3',
  [CstType.AXIOM]: '4',
  [CstType.FUNCTION]: 'W',
  [CstType.PREDICATE]: 'E',
  [CstType.CONSTANT]: '5',
  [CstType.STATEMENT]: '6',
  [CstType.NOMINAL]: '7'
};

const TOKEN_TITLE_LID: Partial<Record<TokenID, string>> = {
  [TokenID.BOOLEAN]: 'tx.rslang.token.boolean',
  [TokenID.DECART]: 'tx.rslang.token.decart',
  [TokenID.PUNCTUATION_PL]: 'tx.rslang.token.punctuationPl',
  [TokenID.PUNCTUATION_SL]: 'tx.rslang.token.punctuationSl',
  [TokenID.QUANTOR_UNIVERSAL]: 'tx.rslang.token.quantorUniversal',
  [TokenID.QUANTOR_EXISTS]: 'tx.rslang.token.quantorExists',
  [TokenID.LOGIC_NOT]: 'tx.rslang.token.logicNot',
  [TokenID.LOGIC_AND]: 'tx.rslang.token.logicAnd',
  [TokenID.LOGIC_OR]: 'tx.rslang.token.logicOr',
  [TokenID.LOGIC_IMPLICATION]: 'tx.rslang.token.logicImplication',
  [TokenID.LOGIC_EQUIVALENT]: 'tx.rslang.token.logicEquivalent',
  [TokenID.LIT_EMPTYSET]: 'tx.rslang.token.litEmptyset',
  [TokenID.LIT_WHOLE_NUMBERS]: 'tx.rslang.token.litWholeNumbers',
  [TokenID.EQUAL]: 'tx.rslang.token.equal',
  [TokenID.MULTIPLY]: 'tx.rslang.token.multiply',
  [TokenID.NOTEQUAL]: 'tx.rslang.token.notequal',
  [TokenID.GREATER_OR_EQ]: 'tx.rslang.token.greaterOrEq',
  [TokenID.LESSER_OR_EQ]: 'tx.rslang.token.lesserOrEq',
  [TokenID.SET_IN]: 'tx.rslang.token.setIn',
  [TokenID.SET_NOT_IN]: 'tx.rslang.token.setNotIn',
  [TokenID.SUBSET_OR_EQ]: 'tx.rslang.token.subsetOrEq',
  [TokenID.SUBSET]: 'tx.rslang.token.subset',
  [TokenID.NOT_SUBSET]: 'tx.rslang.token.notSubset',
  [TokenID.SET_INTERSECTION]: 'tx.rslang.token.setIntersection',
  [TokenID.SET_UNION]: 'tx.rslang.token.setUnion',
  [TokenID.SET_MINUS]: 'tx.rslang.token.setMinus',
  [TokenID.SET_SYMMETRIC_MINUS]: 'tx.rslang.token.setSymmetricMinus',
  [TokenID.NT_DECLARATIVE_EXPR]: 'tx.rslang.token.ntDeclarativeExpr',
  [TokenID.NT_IMPERATIVE_EXPR]: 'tx.rslang.token.ntImperativeExpr',
  [TokenID.NT_RECURSIVE_FULL]: 'tx.rslang.token.ntRecursiveFull',
  [TokenID.BIGPR]: 'tx.rslang.token.bigpr',
  [TokenID.SMALLPR]: 'tx.rslang.token.smallpr',
  [TokenID.FILTER]: 'tx.rslang.token.filter',
  [TokenID.REDUCE]: 'tx.rslang.token.reduce',
  [TokenID.CARD]: 'tx.rslang.cardinality',
  [TokenID.BOOL]: 'tx.rslang.token.bool',
  [TokenID.DEBOOL]: 'tx.rslang.token.debool',
  [TokenID.ASSIGN]: 'tx.rslang.token.assign',
  [TokenID.ITERATE]: 'tx.rslang.token.iterate'
};

const TOKEN_HOTKEY: Partial<Record<TokenID, string>> = {
  [TokenID.BOOLEAN]: 'Alt + E / Shift + B',
  [TokenID.DECART]: 'Alt + Shift + E / Shift + 8',
  [TokenID.PUNCTUATION_PL]: 'Alt + Shift + 9',
  [TokenID.PUNCTUATION_SL]: 'Alt + [',
  [TokenID.QUANTOR_UNIVERSAL]: '`',
  [TokenID.QUANTOR_EXISTS]: 'Shift + `',
  [TokenID.LOGIC_NOT]: 'Alt + `',
  [TokenID.LOGIC_AND]: 'Alt + 3 ~ Shift + 7',
  [TokenID.LOGIC_OR]: 'Alt + Shift + 3',
  [TokenID.LOGIC_IMPLICATION]: 'Alt + 4',
  [TokenID.LOGIC_EQUIVALENT]: 'Alt + Shift + 4',
  [TokenID.LIT_EMPTYSET]: 'Alt + X',
  [TokenID.LIT_WHOLE_NUMBERS]: 'Alt + Z',
  [TokenID.MULTIPLY]: 'Alt + 8',
  [TokenID.NOTEQUAL]: 'Alt + Shift + `',
  [TokenID.GREATER_OR_EQ]: 'Alt + Shift + 7',
  [TokenID.LESSER_OR_EQ]: 'Alt + Shift + 8',
  [TokenID.SET_IN]: 'Alt + 1',
  [TokenID.SET_NOT_IN]: 'Alt + Shift + 1',
  [TokenID.SUBSET_OR_EQ]: 'Alt + 2',
  [TokenID.SUBSET]: 'Alt + 7',
  [TokenID.NOT_SUBSET]: 'Alt + Shift + 2',
  [TokenID.SET_INTERSECTION]: 'Alt + A',
  [TokenID.SET_UNION]: 'Alt + S',
  [TokenID.SET_MINUS]: 'Alt + 5',
  [TokenID.SET_SYMMETRIC_MINUS]: 'Alt + Shift + 5',
  [TokenID.NT_DECLARATIVE_EXPR]: 'Alt + D',
  [TokenID.NT_IMPERATIVE_EXPR]: 'Alt + G',
  [TokenID.NT_RECURSIVE_FULL]: 'Alt + T',
  [TokenID.BIGPR]: 'Alt + Q',
  [TokenID.SMALLPR]: 'Alt + W',
  [TokenID.FILTER]: 'Alt + F',
  [TokenID.REDUCE]: 'Alt + R',
  [TokenID.CARD]: 'Alt + C',
  [TokenID.BOOL]: 'Alt + B',
  [TokenID.DEBOOL]: 'Alt + V',
  [TokenID.ASSIGN]: 'Alt + Shift + 6',
  [TokenID.ITERATE]: 'Alt + 6'
};

/** Generates description for {@link Constituenta}. */
export function describeConstituenta(cst: Constituenta): string {
  if (cst.cst_type === CstType.STRUCTURED) {
    return (
      cst.term_resolved ||
      cst.term_raw ||
      cst.definition_resolved ||
      cst.definition_raw ||
      cst.convention ||
      cst.definition_formal
    );
  } else {
    return (
      cst.term_resolved ||
      cst.term_raw ||
      cst.definition_resolved ||
      cst.definition_raw ||
      cst.definition_formal ||
      cst.convention
    );
  }
}

/** Generates description for term of a given {@link Constituenta}. */
export function describeConstituentaTerm(cst: Constituenta | null): string {
  if (!cst) {
    return '!MISSING!';
  }
  if (!cst.term_resolved) {
    return '!EMPTY!';
  } else {
    return cst.term_resolved;
  }
}

/** Generates label for {@link Constituenta}. */
export function labelConstituenta(cst: Constituenta) {
  return `${cst.alias}: ${describeConstituenta(cst)}`;
}

/** Return shortcut description for {@link CstType}. */
export function getCstTypeShortcut(type: CstType) {
  const key = cstTypeShortcutKeyRecord[type];
  const label = labelCstType(type);
  return key ? `${label} [Alt + ${key}]` : label;
}

/** Generates label for RS expression based on {@link CstType}. */
export function labelRSExpression(type: CstType): string {
  const id = RS_EXPRESSION_LID[type];
  return id ? globalTx(id) : globalTx('tx.lib.defineFormal');
}

/** Generates placeholder for RS definition based on {@link CstType}. */
export function getRSDefinitionPlaceholder(type: CstType): string {
  const example = RS_PLACEHOLDER_EXAMPLE[type];
  return !example ? '' : `${globalTx('tx.general.example')}${globalTx('tx.general.colon')}${example}`;
}

/** Generates description for {@link TokenID}. */
export function describeToken(id: TokenID): string {
  const titleId = TOKEN_TITLE_LID[id];
  if (!titleId) {
    return 'no description: ' + String(id);
  }
  const title = globalTx(titleId);
  const hotkey = TOKEN_HOTKEY[id];
  return hotkey ? prepareTooltip(title, hotkey) : title;
}

/** Retrieves label for {@link TGColoring}. */
export function labelColoring(mode: TGColoring): string {
  const lidKey = COLORING_LID[mode];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN COLORING: ' + String(mode);
}

/** Retrieves label for {@link InteractionMode}. */
export function labelGraphMode(mode: InteractionMode): string {
  const lidKey = GRAPH_MODE_LID[mode];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN GRAPH MODE: ' + String(mode);
}

/** Retrieves label for {@link TGEdgeType}. */
export function labelEdgeType(mode: TGEdgeType): string {
  const lidKey = EDGE_TYPE_LID[mode];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN GRAPH TYPE: ' + String(mode);
}

/** Retrieves label for {@link CstStatus}. */
export function labelExpressionStatus(status: CstStatus): string {
  const lidKey = EXPR_STATUS_LID[status];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN EXPRESSION STATUS: ' + String(status);
}

/** Retrieves description for {@link CstStatus}. */
export function describeExpressionStatus(status: CstStatus): string {
  const lidKey = EXPR_STATUS_DESC_LID[status];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN EXPRESSION STATUS: ' + String(status);
}

/** Retrieves label for {@link CstType}. */
export function labelCstType(target: CstType): string {
  const lidKey = CST_TYPE_LID[target];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN CST TYPE: ' + String(target);
}

/** Retrieves label for {@link CstClass}. */
export function labelCstClass(target: CstClass): string {
  const lidKey = CST_CLASS_LABEL_LID[target];
  return lidKey ? globalTx(lidKey).toLocaleLowerCase() : 'UNKNOWN CST CLASS: ' + String(target);
}

/** Retrieves description for {@link CstClass}. */
export function describeCstClass(target: CstClass): string {
  const lidKey = CST_CLASS_DESC_LID[target];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN CST CLASS: ' + String(target);
}

/** Generates error description for {@link RSErrorCode}. */
export function describeRSError(code: RSErrorCode, params: readonly string[] = []): string {
  const id = RSLANG_ERROR_MESSAGE_ID[code];
  if (id === undefined) {
    return 'UNKNOWN ERROR';
  }
  switch (code) {
    case RSErrorCode.bracketMismatch:
      return globalTx(id, { expected: params[0] ?? '', actual: params[1] ?? '' });
    case RSErrorCode.missingOpenBracket:
    case RSErrorCode.missingCloseBracket:
      return globalTx(id, { bracket: params[0] ?? '' });
    case RSErrorCode.localDoubleDeclare:
    case RSErrorCode.localNotUsed:
    case RSErrorCode.localUndeclared:
    case RSErrorCode.localShadowing:
    case RSErrorCode.globalNotTyped:
    case RSErrorCode.globalFuncWithoutArgs:
    case RSErrorCode.localOutOfScope:
    case RSErrorCode.localOutOfScopeParentheses:
    case RSErrorCode.radicalUsage:
    case RSErrorCode.localUndeclaredInSubexpr:
      return globalTx(id, { name: params[0] ?? '', domain: params[1] ?? '' });
    case RSErrorCode.globalNoValue:
    case RSErrorCode.calcGlobalMissing:
      return globalTx(id, { name: params[0] ?? '' });
    case RSErrorCode.forbiddenCharacter:
      return globalTx(id, { character: params[0] ?? '' });
    case RSErrorCode.typesNotEqual:
    case RSErrorCode.invalidEnumeration:
    case RSErrorCode.invalidArgsArity:
    case RSErrorCode.typesNotCompatible:
    case RSErrorCode.calcInvalidData:
      return globalTx(id, { a: params[0] ?? '', b: params[1] ?? '', operator: params[2] ?? '' });
    case RSErrorCode.invalidDecart:
    case RSErrorCode.invalidBoolean:
    case RSErrorCode.invalidCard:
    case RSErrorCode.invalidDebool:
    case RSErrorCode.invalidReduce:
      return globalTx(id, { arg: params[0] ?? '' });
    case RSErrorCode.invalidTypeOperation:
    case RSErrorCode.invalidQuantifierDomain:
      return globalTx(id, { operator: params[0] ?? '', type: params[1] ?? '' });
    case RSErrorCode.arithmeticNotSupported:
    case RSErrorCode.orderingNotSupported:
    case RSErrorCode.expectedSetexpr:
      return globalTx(id, { type: params[0] ?? '', operator: params[1] ?? '' });
    case RSErrorCode.expectedLogic:
      return globalTx(id, { type: params[0] ?? '' });
    case RSErrorCode.expectedType:
      return globalTx(id, {
        expected: labelTypeClass(Number(params[0]) as TypeClass),
        actual: params[1] ?? ''
      });
    case RSErrorCode.definitionNotAllowed:
      return globalTx(id, {
        cstType: labelCstType((params[0] ?? CstType.BASE) as CstType),
        alias: params[1] ?? ''
      });
    case RSErrorCode.projectionSetArgumentNotSet:
    case RSErrorCode.projectionSetArgumentNotTupleSet:
    case RSErrorCode.projectionTupleArgumentNotTuple:
      return globalTx(id, { operator: params[0] ?? '', actual: params[1] ?? '' });
    case RSErrorCode.projectionSetIndexOutOfRange:
    case RSErrorCode.projectionTupleIndexOutOfRange:
      return globalTx(id, {
        operator: params[0] ?? '',
        index: params[1] ?? '',
        arity: params[2] ?? '',
        actual: params[3] ?? ''
      });
    case RSErrorCode.invalidElementPredicate:
      return globalTx(id, { a: params[0] ?? '', b: params[1] ?? '', c: params[2] ?? '' });
    case RSErrorCode.invalidArgumentType:
      return globalTx(id, { expected: params[0] ?? '', actual: params[1] ?? '' });
    case RSErrorCode.invalidFilterArgumentType:
      return globalTx(id, {
        operator: params[0] ?? '',
        actual: params[1] ?? '',
        expected: params[2] ?? ''
      });
    case RSErrorCode.invalidFilterArity:
      return globalTx(id, {
        indexCount: params[0] ?? '',
        paramCount: params[1] ?? '',
        operator: params[2] ?? ''
      });
    case RSErrorCode.invalidFilterParameterType:
      return globalTx(id, {
        param: params[0] ?? '',
        expected: params[1] ?? '',
        operator: params[2] ?? ''
      });
    case RSErrorCode.invalidFilterIndex:
      return globalTx(id, {
        operator: params[0] ?? '',
        actual: params[1] ?? '',
        index: params[2] ?? '',
        arity: params[3] ?? ''
      });
    case RSErrorCode.invalidFilterBooleanEchelon:
      return globalTx(id, {
        operator: params[0] ?? '',
        actual: params[1] ?? '',
        expected: params[2] ?? ''
      });
    case RSErrorCode.setOverflow:
    case RSErrorCode.booleanBaseLimit:
    case RSErrorCode.iterationsLimit:
      return globalTx(id, { limit: params[0] ?? '' });
    default:
      return globalTx(id);
  }
}

/** Generates label for type class. */
export function labelTypeClass(type: TypeClass): string {
  const id = TYPE_CLASS_LID[type];
  return id ? globalTx(id) : String(type);
}
