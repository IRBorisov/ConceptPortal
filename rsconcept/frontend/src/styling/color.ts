/**
 * Module: Single place for all color definitions in code (see index.css for full defs).
 */

import { GramData, Grammeme, NounGrams, PartOfSpeech, VerbGrams } from '@/features/rsform/models/language';
import { CstClass, ExpressionStatus, IConstituenta } from '@/features/rsform/models/rsform';
import { ISyntaxTreeNode, TokenID } from '@/features/rsform/models/rslang';
import { TMGraphNode } from '@/features/rsform/models/TMGraph';
import { GraphColoring } from '@/features/rsform/stores/termGraph';
import { PARAMETER } from '@/utils/constants';

/** Semantic colors for application. */
// prettier-ignore
export const APP_COLORS = {
  bgDefault:          'var(--clr-prim-100)',
  bgInput:            'var(--clr-prim-0)', 
  bgControls:         'var(--clr-prim-200)',
  bgDisabled:         'var(--clr-prim-300)',
  bgPrimary:          'var(--clr-sec-600)',
  bgSelected:         'var(--clr-sec-200)',
  bgActiveSelection:  'var(--clr-select-node)',
  bgHover:            'var(--clr-sec-100)',
  bgWarning:          'var(--clr-warn-100)',
  
  border:             'var(--clr-prim-400)',

  fgDefault:          'var(--clr-prim-999)',
  fgSelected:         'var(--clr-prim-999)', 
  fgDisabled:         'var(--clr-prim-800)',
  fgWarning:          'var(--clr-warn-600)',

  bgRed:              'var(--acc-bg-red)',
  bgGreen:            'var(--acc-bg-green)',
  bgBlue:             'var(--acc-bg-blue)',
  bgPurple:           'var(--acc-bg-purple)',
  bgTeal:             'var(--acc-bg-teal)',
  bgOrange:           'var(--acc-bg-orange)',

  bgGreen25:          'var(--acc-bg-green25)',
  bgGreen50:          'var(--acc-bg-green50)',
  bgOrange50:         'var(--acc-bg-orange50)',

  fgRed:              'var(--acc-fg-red)',
  fgGreen:            'var(--acc-fg-green)',
  fgBlue:             'var(--acc-fg-blue)',
  fgPurple:           'var(--acc-fg-purple)',
  fgTeal:             'var(--acc-fg-teal)',
  fgOrange:           'var(--acc-fg-orange)'
}

/**
 * Represents Select component theme.
 */
export const SELECT_THEME = {
  primary: APP_COLORS.bgPrimary,
  primary75: APP_COLORS.bgSelected,
  primary50: APP_COLORS.bgHover,
  primary25: APP_COLORS.bgHover,

  danger: APP_COLORS.fgWarning,
  dangerLight: APP_COLORS.bgWarning,

  neutral0: APP_COLORS.bgInput,
  neutral5: APP_COLORS.bgDefault,
  neutral10: APP_COLORS.border,
  neutral20: APP_COLORS.border,
  neutral30: APP_COLORS.border,
  neutral40: APP_COLORS.fgDisabled,
  neutral50: APP_COLORS.fgDisabled, // placeholder
  neutral60: APP_COLORS.fgDefault,
  neutral70: APP_COLORS.fgWarning,
  neutral80: APP_COLORS.fgDefault,
  neutral90: APP_COLORS.fgWarning
};

/**
 * Represents Brackets highlights theme.
 */
export const BRACKETS_THEME = {
  '.cc-nonmatchingBracket': {
    color: APP_COLORS.fgRed,
    fontWeight: 600
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: APP_COLORS.bgSelected,
    color: APP_COLORS.fgSelected
  }
};

/**
 * Determines background color for {@link ISyntaxTreeNode} based on its type.
 */
export function colorBgSyntaxTree(node: ISyntaxTreeNode): string {
  switch (node.typeID) {
    case TokenID.PUNCTUATION_DEFINE:
    case TokenID.PUNCTUATION_STRUCT:
    case TokenID.ID_LOCAL:
      return APP_COLORS.bgGreen;

    case TokenID.ID_GLOBAL:
    case TokenID.ID_FUNCTION:
    case TokenID.ID_PREDICATE:
    case TokenID.ID_RADICAL:
    case TokenID.LIT_INTEGER:
    case TokenID.LIT_EMPTYSET:
    case TokenID.LIT_WHOLE_NUMBERS:
      return APP_COLORS.bgTeal;

    case TokenID.QUANTOR_UNIVERSAL:
    case TokenID.QUANTOR_EXISTS:
    case TokenID.LOGIC_NOT:
    case TokenID.LOGIC_AND:
    case TokenID.LOGIC_OR:
    case TokenID.LOGIC_IMPLICATION:
    case TokenID.LOGIC_EQUIVALENT:
    case TokenID.GREATER:
    case TokenID.LESSER:
    case TokenID.EQUAL:
    case TokenID.NOTEQUAL:
    case TokenID.GREATER_OR_EQ:
    case TokenID.LESSER_OR_EQ:
    case TokenID.SET_IN:
    case TokenID.SET_NOT_IN:
    case TokenID.SUBSET_OR_EQ:
    case TokenID.SUBSET:
    case TokenID.NOT_SUBSET:
      return APP_COLORS.bgOrange;

    case TokenID.NT_TUPLE:
    case TokenID.NT_ENUMERATION:
    case TokenID.BIGPR:
    case TokenID.SMALLPR:
    case TokenID.FILTER:
    case TokenID.PLUS:
    case TokenID.MINUS:
    case TokenID.MULTIPLY:
    case TokenID.BOOLEAN:
    case TokenID.DECART:
    case TokenID.SET_INTERSECTION:
    case TokenID.SET_UNION:
    case TokenID.SET_MINUS:
    case TokenID.SET_SYMMETRIC_MINUS:
    case TokenID.REDUCE:
    case TokenID.CARD:
    case TokenID.BOOL:
    case TokenID.DEBOOL:
      return APP_COLORS.bgBlue;

    case TokenID.NT_FUNC_DEFINITION:
    case TokenID.NT_DECLARATIVE_EXPR:
    case TokenID.NT_IMPERATIVE_EXPR:
    case TokenID.NT_RECURSIVE_FULL:
    case TokenID.NT_ENUM_DECL:
    case TokenID.NT_TUPLE_DECL:
    case TokenID.NT_ARG_DECL:
    case TokenID.NT_FUNC_CALL:
    case TokenID.NT_ARGUMENTS:
    case TokenID.NT_RECURSIVE_SHORT:
      return APP_COLORS.bgDisabled;

    case TokenID.ASSIGN:
    case TokenID.ITERATE:
      return APP_COLORS.bgRed;
  }

  switch (node.data.value) {
    case 'Expression':
    case 'Local':
      return APP_COLORS.bgGreen;

    case 'Global':
    case 'Radical':
    case 'Function':
    case 'Predicate':
    case 'Literal':
    case 'Integer':
    case 'EmptySet':
    case 'IntegerSet':
      return APP_COLORS.bgTeal;

    case 'Logic':
    case 'Logic_predicates':
    case 'Variable':
    case 'Tuple':
    case 'Setexpr_enum_min2':
    case 'Setexpr_enum':
    case 'Setexpr':
    case 'Setexpr_binary':
    case 'Setexpr_generators':
    case 'Enumeration':
    case 'Boolean':
    case 'Filter_expression':
    case 'Filter':
    case 'Declarative':
    case 'Imperative':
    case 'Imp_blocks':
    case 'Recursion':
    case 'TextFunction':
    case 'Logic_unary':
    case 'Logic_quantor':
    case 'Variable_pack':
    case 'Logic_binary':
    case 'Function_decl':
    case 'Arguments':
    case 'Declaration':
      return APP_COLORS.bgBlue;

    case 'BigPr':
    case 'SmallPr':
    case 'Card':
    case 'Bool':
    case 'Debool':
    case 'Red':
    case 'PrefixD':
    case 'PrefixI':
    case 'PrefixR':
      return APP_COLORS.bgPurple;

    case PARAMETER.errorNodeLabel:
      return APP_COLORS.bgRed;
  }
  // node
  return APP_COLORS.bgPurple;
}

/**
 * Determines background color for {@link ExpressionStatus}.
 */
export function colorBgCstStatus(status: ExpressionStatus): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return APP_COLORS.bgGreen;
    case ExpressionStatus.INCORRECT: return APP_COLORS.bgRed;
    case ExpressionStatus.INCALCULABLE: return APP_COLORS.bgOrange;
    case ExpressionStatus.PROPERTY: return APP_COLORS.bgTeal;
    case ExpressionStatus.UNKNOWN: return APP_COLORS.bgSelected;
    case ExpressionStatus.UNDEFINED: return APP_COLORS.bgBlue;
  }
}

/**
 * Determines statusbar color for {@link ExpressionStatus}.
 */
export function colorStatusBar(status: ExpressionStatus): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return APP_COLORS.bgGreen50;
    case ExpressionStatus.INCORRECT: return APP_COLORS.bgRed;
    case ExpressionStatus.INCALCULABLE: return APP_COLORS.bgOrange;
    case ExpressionStatus.PROPERTY: return APP_COLORS.bgTeal;
    case ExpressionStatus.UNKNOWN: return APP_COLORS.bgSelected;
    case ExpressionStatus.UNDEFINED: return APP_COLORS.bgBlue;
  }
}

/**
 * Determines foreground color for {@link ExpressionStatus}.
 */
export function colorFgCstStatus(status: ExpressionStatus): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return APP_COLORS.fgGreen;
    case ExpressionStatus.INCORRECT: return APP_COLORS.fgRed;
    case ExpressionStatus.INCALCULABLE: return APP_COLORS.fgOrange;
    case ExpressionStatus.PROPERTY: return APP_COLORS.fgTeal;
    case ExpressionStatus.UNKNOWN: return APP_COLORS.fgBlue;
    case ExpressionStatus.UNDEFINED: return APP_COLORS.fgBlue;
  }
}

/**
 * Determines background color for {@link IConstituenta} depending on its {@link CstClass}.
 */
export function colorBgCstClass(cstClass: CstClass): string {
  // prettier-ignore
  switch (cstClass) {
    case CstClass.BASIC: return APP_COLORS.bgGreen;
    case CstClass.DERIVED: return APP_COLORS.bgBlue;
    case CstClass.STATEMENT: return APP_COLORS.bgRed;
    case CstClass.TEMPLATE: return APP_COLORS.bgTeal;
  }
}

/**
 * Determines background color for {@link IConstituenta} depending on its parent schema index.
 */
export function colorBgSchemas(schema_index: number): string {
  if (schema_index === 0) {
    return APP_COLORS.bgGreen;
  }
  // prettier-ignore
  switch (schema_index % 4) {
    case 1: return APP_COLORS.bgPurple;
    case 2: return APP_COLORS.bgOrange;
    case 3: return APP_COLORS.bgTeal;
    case 0: return APP_COLORS.bgBlue;
  }
  return APP_COLORS.bgBlue;
}

/**
 * Determines background color for {@link GramData}.
 */
export function colorBgGrammeme(gram: GramData): string {
  if (PartOfSpeech.includes(gram as Grammeme)) {
    return APP_COLORS.bgBlue;
  }
  if (NounGrams.includes(gram as Grammeme)) {
    return APP_COLORS.bgGreen;
  }
  if (VerbGrams.includes(gram as Grammeme)) {
    return APP_COLORS.bgTeal;
  }
  return APP_COLORS.bgInput;
}

/**
 * Determines foreground color for {@link GramData}.
 */
export function colorFgGrammeme(gram: GramData): string {
  if (PartOfSpeech.includes(gram as Grammeme)) {
    return APP_COLORS.fgBlue;
  }
  if (NounGrams.includes(gram as Grammeme)) {
    return APP_COLORS.fgGreen;
  }
  if (VerbGrams.includes(gram as Grammeme)) {
    return APP_COLORS.fgTeal;
  }
  if (!Object.values(Grammeme).includes(gram as Grammeme)) {
    return APP_COLORS.fgRed;
  } else {
    return APP_COLORS.fgPurple;
  }
}

/**
 * Determines graph color for {@link IConstituenta}.
 */
export function colorBgGraphNode(cst: IConstituenta, coloringScheme: GraphColoring): string {
  if (coloringScheme === 'type') {
    return colorBgCstClass(cst.cst_class);
  }
  if (coloringScheme === 'status') {
    return colorBgCstStatus(cst.status);
  }
  if (coloringScheme === 'schemas') {
    return colorBgSchemas(cst.parent_schema_index);
  }
  return '';
}

/**
 * Determines m-graph color for {@link TMGraphNode}.
 */
export function colorBgTMGraphNode(node: TMGraphNode): string {
  if (node.rank === 0) {
    return APP_COLORS.bgControls;
  }
  if (node.parents.length === 1) {
    return APP_COLORS.bgTeal;
  }
  return APP_COLORS.bgOrange;
}
