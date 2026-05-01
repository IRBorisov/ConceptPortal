/**
 * Generates description for {@link Constituenta}.
 */

import { type Constituenta, CstClass, CstStatus, CstType } from '@/domain/library';
import { TokenID } from '@/domain/rslang';

import { formatLabel } from '@/app/i18n/format-app-message';
import { rsformLid } from '@/app/i18n/labels/rsform-ui';

import { prepareTooltip } from '@/utils/format';
import { type RO } from '@/utils/meta';

import { type InteractionMode, type TGColoring, type TGEdgeType } from './stores/term-graph';

const CST_TYPE_LID: Record<CstType, string> = {
  [CstType.NOMINAL]: rsformLid.cstType.nominal,
  [CstType.BASE]: rsformLid.cstType.basic,
  [CstType.CONSTANT]: rsformLid.cstType.constant,
  [CstType.STRUCTURED]: rsformLid.cstType.structure,
  [CstType.AXIOM]: rsformLid.cstType.axiom,
  [CstType.TERM]: rsformLid.cstType.term,
  [CstType.FUNCTION]: rsformLid.cstType.function,
  [CstType.PREDICATE]: rsformLid.cstType.predicate,
  [CstType.THEOREM]: rsformLid.cstType.theorem
};

const CST_CLASS_LABEL_LID: Record<CstClass, string> = {
  [CstClass.NOMINAL]: rsformLid.cstClassLabel.nominal,
  [CstClass.BASIC]: rsformLid.cstClassLabel.basic,
  [CstClass.DERIVED]: rsformLid.cstClassLabel.derived,
  [CstClass.STATEMENT]: rsformLid.cstClassLabel.statement,
  [CstClass.TEMPLATE]: rsformLid.cstClassLabel.template
};

const CST_CLASS_DESC_LID: Record<CstClass, string> = {
  [CstClass.NOMINAL]: rsformLid.cstClassDesc.nominal,
  [CstClass.BASIC]: rsformLid.cstClassDesc.basic,
  [CstClass.DERIVED]: rsformLid.cstClassDesc.derived,
  [CstClass.STATEMENT]: rsformLid.cstClassDesc.statement,
  [CstClass.TEMPLATE]: rsformLid.cstClassDesc.template
};

const GRAPH_MODE_LID: Record<InteractionMode, string> = {
  explore: rsformLid.graphMode.explore,
  edit: rsformLid.graphMode.edit
};

const COLORING_LID: Record<TGColoring, string> = {
  none: rsformLid.coloring.none,
  status: rsformLid.coloring.status,
  type: rsformLid.coloring.type,
  schemas: rsformLid.coloring.schemas
};

const EDGE_TYPE_LID: Record<TGEdgeType, string> = {
  full: rsformLid.edgeType.full,
  definition: rsformLid.edgeType.definition,
  attribution: rsformLid.edgeType.attribution
};

const EXPR_STATUS_LID: Record<CstStatus, string> = {
  [CstStatus.VERIFIED]: rsformLid.exprStatus.verified,
  [CstStatus.INCORRECT]: rsformLid.exprStatus.incorrect,
  [CstStatus.INCALCULABLE]: rsformLid.exprStatus.incalculable,
  [CstStatus.PROPERTY]: rsformLid.exprStatus.property,
  [CstStatus.UNKNOWN]: rsformLid.exprStatus.unknown
};

const EXPR_STATUS_DESC_LID: Record<CstStatus, string> = {
  [CstStatus.VERIFIED]: rsformLid.exprStatusDesc.verified,
  [CstStatus.INCORRECT]: rsformLid.exprStatusDesc.incorrect,
  [CstStatus.INCALCULABLE]: rsformLid.exprStatusDesc.incalculable,
  [CstStatus.PROPERTY]: rsformLid.exprStatusDesc.property,
  [CstStatus.UNKNOWN]: rsformLid.exprStatusDesc.unknown
};

const RS_EXPRESSION_LID: Record<CstType, string> = {
  [CstType.NOMINAL]: rsformLid.rsExpression.nominal,
  [CstType.BASE]: rsformLid.rsExpression.basic,
  [CstType.CONSTANT]: rsformLid.rsExpression.constant,
  [CstType.STRUCTURED]: rsformLid.rsExpression.structure,
  [CstType.TERM]: rsformLid.rsExpression.term,
  [CstType.THEOREM]: rsformLid.rsExpression.theorem,
  [CstType.AXIOM]: rsformLid.rsExpression.axiom,
  [CstType.FUNCTION]: rsformLid.rsExpression.function,
  [CstType.PREDICATE]: rsformLid.rsExpression.predicate
};

const RS_PLACEHOLDER_LID: Record<CstType, string> = {
  [CstType.NOMINAL]: rsformLid.rsPlaceholder.nominal,
  [CstType.BASE]: rsformLid.rsPlaceholder.basic,
  [CstType.CONSTANT]: rsformLid.rsPlaceholder.constant,
  [CstType.STRUCTURED]: rsformLid.rsPlaceholder.structure,
  [CstType.TERM]: rsformLid.rsPlaceholder.term,
  [CstType.THEOREM]: rsformLid.rsPlaceholder.theorem,
  [CstType.AXIOM]: rsformLid.rsPlaceholder.axiom,
  [CstType.FUNCTION]: rsformLid.rsPlaceholder.function,
  [CstType.PREDICATE]: rsformLid.rsPlaceholder.predicate
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
  [TokenID.BOOLEAN]: rsformLid.token.boolean,
  [TokenID.DECART]: rsformLid.token.decart,
  [TokenID.PUNCTUATION_PL]: rsformLid.token.punctuationPl,
  [TokenID.PUNCTUATION_SL]: rsformLid.token.punctuationSl,
  [TokenID.QUANTOR_UNIVERSAL]: rsformLid.token.quantorUniversal,
  [TokenID.QUANTOR_EXISTS]: rsformLid.token.quantorExists,
  [TokenID.LOGIC_NOT]: rsformLid.token.logicNot,
  [TokenID.LOGIC_AND]: rsformLid.token.logicAnd,
  [TokenID.LOGIC_OR]: rsformLid.token.logicOr,
  [TokenID.LOGIC_IMPLICATION]: rsformLid.token.logicImplication,
  [TokenID.LOGIC_EQUIVALENT]: rsformLid.token.logicEquivalent,
  [TokenID.LIT_EMPTYSET]: rsformLid.token.litEmptyset,
  [TokenID.LIT_WHOLE_NUMBERS]: rsformLid.token.litWholeNumbers,
  [TokenID.EQUAL]: rsformLid.token.equal,
  [TokenID.MULTIPLY]: rsformLid.token.multiply,
  [TokenID.NOTEQUAL]: rsformLid.token.notequal,
  [TokenID.GREATER_OR_EQ]: rsformLid.token.greaterOrEq,
  [TokenID.LESSER_OR_EQ]: rsformLid.token.lesserOrEq,
  [TokenID.SET_IN]: rsformLid.token.setIn,
  [TokenID.SET_NOT_IN]: rsformLid.token.setNotIn,
  [TokenID.SUBSET_OR_EQ]: rsformLid.token.subsetOrEq,
  [TokenID.SUBSET]: rsformLid.token.subset,
  [TokenID.NOT_SUBSET]: rsformLid.token.notSubset,
  [TokenID.SET_INTERSECTION]: rsformLid.token.setIntersection,
  [TokenID.SET_UNION]: rsformLid.token.setUnion,
  [TokenID.SET_MINUS]: rsformLid.token.setMinus,
  [TokenID.SET_SYMMETRIC_MINUS]: rsformLid.token.setSymmetricMinus,
  [TokenID.NT_DECLARATIVE_EXPR]: rsformLid.token.ntDeclarativeExpr,
  [TokenID.NT_IMPERATIVE_EXPR]: rsformLid.token.ntImperativeExpr,
  [TokenID.NT_RECURSIVE_FULL]: rsformLid.token.ntRecursiveFull,
  [TokenID.BIGPR]: rsformLid.token.bigpr,
  [TokenID.SMALLPR]: rsformLid.token.smallpr,
  [TokenID.FILTER]: rsformLid.token.filter,
  [TokenID.REDUCE]: rsformLid.token.reduce,
  [TokenID.CARD]: rsformLid.token.card,
  [TokenID.BOOL]: rsformLid.token.bool,
  [TokenID.DEBOOL]: rsformLid.token.debool,
  [TokenID.ASSIGN]: rsformLid.token.assign,
  [TokenID.ITERATE]: rsformLid.token.iterate
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
    return formatLabel(rsformLid.missing.constituent);
  }
  if (!cst.term_resolved) {
    return formatLabel(rsformLid.missing.termEmpty);
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
  return key ? formatLabel(rsformLid.shortcutWithKey, { label, key }) : label;
}

/** Generates label for RS expression based on {@link CstType}. */
export function labelRSExpression(type: CstType): string {
  const id = RS_EXPRESSION_LID[type];
  return id ? formatLabel(id) : formatLabel(rsformLid.fallback.formalExpression);
}

/** Generates placeholder for RS definition based on {@link CstType}. */
export function getRSDefinitionPlaceholder(type: CstType): string {
  const id = RS_PLACEHOLDER_LID[type];
  return id ? formatLabel(id) : formatLabel(rsformLid.fallback.formalExpression);
}

/** Generates description for {@link TokenID}. */
export function describeToken(id: TokenID): string {
  const titleId = TOKEN_TITLE_LID[id];
  if (!titleId) {
    return formatLabel(rsformLid.fallback.noTokenDescription, { id: String(id) });
  }
  const title = formatLabel(titleId);
  const hotkey = TOKEN_HOTKEY[id];
  return hotkey ? prepareTooltip(title, hotkey) : title;
}

/** Retrieves label for {@link TGColoring}. */
export function labelColoring(mode: TGColoring): string {
  const lidKey = COLORING_LID[mode];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownColoring, { mode: String(mode) });
}

/** Retrieves label for {@link InteractionMode}. */
export function labelGraphMode(mode: InteractionMode): string {
  const lidKey = GRAPH_MODE_LID[mode];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownGraphMode, { mode: String(mode) });
}

/** Retrieves label for {@link TGEdgeType}. */
export function labelEdgeType(mode: TGEdgeType): string {
  const lidKey = EDGE_TYPE_LID[mode];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownEdgeType, { mode: String(mode) });
}

/** Retrieves label for {@link CstStatus}. */
export function labelExpressionStatus(status: CstStatus): string {
  const lidKey = EXPR_STATUS_LID[status];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownExprStatus, { status: String(status) });
}

/** Retrieves description for {@link CstStatus}. */
export function describeExpressionStatus(status: CstStatus): string {
  const lidKey = EXPR_STATUS_DESC_LID[status];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownExprStatus, { status: String(status) });
}

/** Retrieves label for {@link CstType}. */
export function labelCstType(target: CstType): string {
  const lidKey = CST_TYPE_LID[target];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownCstType, { type: String(target) });
}

/** Retrieves label for {@link CstClass}. */
export function labelCstClass(target: CstClass): string {
  const lidKey = CST_CLASS_LABEL_LID[target];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownCstClass, { type: String(target) });
}

/** Retrieves description for {@link CstClass}. */
export function describeCstClass(target: CstClass): string {
  const lidKey = CST_CLASS_DESC_LID[target];
  return lidKey ? formatLabel(lidKey) : formatLabel(rsformLid.fallback.unknownCstClass, { type: String(target) });
}
