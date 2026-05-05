/**
 * Generates description for {@link Constituenta}.
 */

import { type Constituenta, CstClass, CstStatus, CstType } from '@/domain/library';
import { TokenID } from '@/domain/rslang';
import { globalTx } from '@/i18n';

import { prepareTooltip } from '@/utils/format';
import { type RO } from '@/utils/meta';

import { type InteractionMode, type TGColoring, type TGEdgeType } from './stores/term-graph';

const CST_TYPE_LID: Record<CstType, string> = {
  [CstType.NOMINAL]: 'labels.rsform.cstType.nominal',
  [CstType.BASE]: 'labels.rsform.cstType.basic',
  [CstType.CONSTANT]: 'labels.rsform.cstType.constant',
  [CstType.STRUCTURED]: 'labels.rsform.cstType.structure',
  [CstType.AXIOM]: 'labels.rsform.cstType.axiom',
  [CstType.TERM]: 'labels.rsform.cstType.term',
  [CstType.FUNCTION]: 'labels.rsform.cstType.function',
  [CstType.PREDICATE]: 'labels.rsform.cstType.predicate',
  [CstType.THEOREM]: 'labels.rsform.cstType.theorem'
};

const CST_CLASS_LABEL_LID: Record<CstClass, string> = {
  [CstClass.NOMINAL]: 'labels.rsform.cstClassLabel.nominal',
  [CstClass.BASIC]: 'labels.rsform.cstClassLabel.basic',
  [CstClass.DERIVED]: 'labels.rsform.cstClassLabel.derived',
  [CstClass.STATEMENT]: 'labels.rsform.cstClassLabel.statement',
  [CstClass.TEMPLATE]: 'labels.rsform.cstClassLabel.template'
};

const CST_CLASS_DESC_LID: Record<CstClass, string> = {
  [CstClass.NOMINAL]: 'labels.rsform.cstClassDesc.nominal',
  [CstClass.BASIC]: 'labels.rsform.cstClassDesc.basic',
  [CstClass.DERIVED]: 'labels.rsform.cstClassDesc.derived',
  [CstClass.STATEMENT]: 'labels.rsform.cstClassDesc.statement',
  [CstClass.TEMPLATE]: 'labels.rsform.cstClassDesc.template'
};

const GRAPH_MODE_LID: Record<InteractionMode, string> = {
  explore: 'labels.rsform.graphMode.explore',
  edit: 'labels.rsform.graphMode.edit'
};

const COLORING_LID: Record<TGColoring, string> = {
  none: 'labels.rsform.coloring.none',
  status: 'labels.rsform.coloring.status',
  type: 'labels.rsform.coloring.type',
  schemas: 'labels.rsform.coloring.schemas'
};

const EDGE_TYPE_LID: Record<TGEdgeType, string> = {
  full: 'labels.rsform.edgeType.full',
  definition: 'labels.rsform.edgeType.definition',
  attribution: 'labels.rsform.edgeType.attribution'
};

const EXPR_STATUS_LID: Record<CstStatus, string> = {
  [CstStatus.VERIFIED]: 'labels.rsform.exprStatus.verified',
  [CstStatus.INCORRECT]: 'labels.rsform.exprStatus.incorrect',
  [CstStatus.INCALCULABLE]: 'labels.rsform.exprStatus.incalculable',
  [CstStatus.PROPERTY]: 'labels.rsform.exprStatus.property',
  [CstStatus.UNKNOWN]: 'labels.rsform.exprStatus.unknown'
};

const EXPR_STATUS_DESC_LID: Record<CstStatus, string> = {
  [CstStatus.VERIFIED]: 'labels.rsform.exprStatusDesc.verified',
  [CstStatus.INCORRECT]: 'labels.rsform.exprStatusDesc.incorrect',
  [CstStatus.INCALCULABLE]: 'labels.rsform.exprStatusDesc.incalculable',
  [CstStatus.PROPERTY]: 'labels.rsform.exprStatusDesc.property',
  [CstStatus.UNKNOWN]: 'labels.rsform.exprStatusDesc.unknown'
};

const RS_EXPRESSION_LID: Record<CstType, string> = {
  [CstType.NOMINAL]: 'labels.rsform.rsExpression.nominal',
  [CstType.BASE]: 'semantic.term.definitionFormal',
  [CstType.CONSTANT]: 'semantic.term.definitionFormal',
  [CstType.STRUCTURED]: 'labels.rsform.rsExpression.structure',
  [CstType.TERM]: 'semantic.term.definitionFormal',
  [CstType.THEOREM]: 'semantic.term.definitionFormal',
  [CstType.AXIOM]: 'semantic.term.definitionFormal',
  [CstType.FUNCTION]: 'labels.rsform.rsExpression.function',
  [CstType.PREDICATE]: 'labels.rsform.rsExpression.function'
};

const RS_PLACEHOLDER_EXAMPLE: Record<CstType, string> = {
  [CstType.NOMINAL]: '',
  [CstType.BASE]: '',
  [CstType.CONSTANT]: '',
  [CstType.STRUCTURED]: 'ℬ(X1×D2)',
  [CstType.TERM]: 'D{ξ∈S1 | Pr1(ξ)∩Pr2(ξ)=∅}',
  [CstType.THEOREM]: 'D11=∅',
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
  [CstType.THEOREM]: '6',
  [CstType.NOMINAL]: '7'
};

const TOKEN_TITLE_LID: Partial<Record<TokenID, string>> = {
  [TokenID.BOOLEAN]: 'labels.rsform.token.boolean',
  [TokenID.DECART]: 'labels.rsform.token.decart',
  [TokenID.PUNCTUATION_PL]: 'labels.rsform.token.punctuationPl',
  [TokenID.PUNCTUATION_SL]: 'labels.rsform.token.punctuationSl',
  [TokenID.QUANTOR_UNIVERSAL]: 'labels.rsform.token.quantorUniversal',
  [TokenID.QUANTOR_EXISTS]: 'labels.rsform.token.quantorExists',
  [TokenID.LOGIC_NOT]: 'labels.rsform.token.logicNot',
  [TokenID.LOGIC_AND]: 'labels.rsform.token.logicAnd',
  [TokenID.LOGIC_OR]: 'labels.rsform.token.logicOr',
  [TokenID.LOGIC_IMPLICATION]: 'labels.rsform.token.logicImplication',
  [TokenID.LOGIC_EQUIVALENT]: 'labels.rsform.token.logicEquivalent',
  [TokenID.LIT_EMPTYSET]: 'labels.rsform.token.litEmptyset',
  [TokenID.LIT_WHOLE_NUMBERS]: 'labels.rsform.token.litWholeNumbers',
  [TokenID.EQUAL]: 'labels.rsform.token.equal',
  [TokenID.MULTIPLY]: 'labels.rsform.token.multiply',
  [TokenID.NOTEQUAL]: 'labels.rsform.token.notequal',
  [TokenID.GREATER_OR_EQ]: 'labels.rsform.token.greaterOrEq',
  [TokenID.LESSER_OR_EQ]: 'labels.rsform.token.lesserOrEq',
  [TokenID.SET_IN]: 'labels.rsform.token.setIn',
  [TokenID.SET_NOT_IN]: 'labels.rsform.token.setNotIn',
  [TokenID.SUBSET_OR_EQ]: 'labels.rsform.token.subsetOrEq',
  [TokenID.SUBSET]: 'labels.rsform.token.subset',
  [TokenID.NOT_SUBSET]: 'labels.rsform.token.notSubset',
  [TokenID.SET_INTERSECTION]: 'labels.rsform.token.setIntersection',
  [TokenID.SET_UNION]: 'labels.rsform.token.setUnion',
  [TokenID.SET_MINUS]: 'labels.rsform.token.setMinus',
  [TokenID.SET_SYMMETRIC_MINUS]: 'labels.rsform.token.setSymmetricMinus',
  [TokenID.NT_DECLARATIVE_EXPR]: 'labels.rsform.token.ntDeclarativeExpr',
  [TokenID.NT_IMPERATIVE_EXPR]: 'labels.rsform.token.ntImperativeExpr',
  [TokenID.NT_RECURSIVE_FULL]: 'labels.rsform.token.ntRecursiveFull',
  [TokenID.BIGPR]: 'labels.rsform.token.bigpr',
  [TokenID.SMALLPR]: 'labels.rsform.token.smallpr',
  [TokenID.FILTER]: 'labels.rsform.token.filter',
  [TokenID.REDUCE]: 'labels.rsform.token.reduce',
  [TokenID.CARD]: 'labels.rsform.token.card',
  [TokenID.BOOL]: 'labels.rsform.token.bool',
  [TokenID.DEBOOL]: 'labels.rsform.token.debool',
  [TokenID.ASSIGN]: 'labels.rsform.token.assign',
  [TokenID.ITERATE]: 'labels.rsform.token.iterate'
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
export function describeConstituenta(cst: RO<Constituenta>): string {
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
export function describeConstituentaTerm(cst: RO<Constituenta> | null): string {
  if (!cst) {
    return globalTx('labels.rsform.missing.constituent');
  }
  if (!cst.term_resolved) {
    return globalTx('labels.rsform.missing.termEmpty');
  } else {
    return cst.term_resolved;
  }
}

/** Generates label for {@link Constituenta}. */
export function labelConstituenta(cst: RO<Constituenta>) {
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
  return id ? globalTx(id) : globalTx('semantic.term.definitionFormal');
}

/** Generates placeholder for RS definition based on {@link CstType}. */
export function getRSDefinitionPlaceholder(type: CstType): string {
  const example = RS_PLACEHOLDER_EXAMPLE[type];
  return !example ? '' : `${globalTx('semantic.example')}: ${example}`;
}

/** Generates description for {@link TokenID}. */
export function describeToken(id: TokenID): string {
  const titleId = TOKEN_TITLE_LID[id];
  if (!titleId) {
    return globalTx('labels.rsform.fallback.noTokenDescription', { id: String(id) });
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
  return lidKey ? globalTx(lidKey) : 'UNKNOWN CST CLASS: ' + String(target);
}

/** Retrieves description for {@link CstClass}. */
export function describeCstClass(target: CstClass): string {
  const lidKey = CST_CLASS_DESC_LID[target];
  return lidKey ? globalTx(lidKey) : 'UNKNOWN CST CLASS: ' + String(target);
}
