/**
 * Module: Single place for all color definitions in code (see index.css for full defs).
 */

import { GramData, Grammeme, NounGrams, PartOfSpeech, VerbGrams } from '@/models/language';
import { GraphColoring } from '@/models/miscellaneous';
import { CstClass, ExpressionStatus, IConstituenta } from '@/models/rsform';
import { ISyntaxTreeNode, TokenID } from '@/models/rslang';
import { TMGraphNode } from '@/models/TMGraph';
import { PARAMETER } from '@/utils/constants';

/**
 * Represents application color theme configuration.
 */
export interface IColorTheme {
  bgDefault: string;
  bgBlur: string;
  bgInput: string;
  bgControls: string;
  bgDisabled: string;
  bgPrimary: string;
  bgSelected: string;
  bgActiveSelection: string;
  bgHover: string;
  bgWarning: string;

  border: string;

  fgDefault: string;
  fgSelected: string;
  fgDisabled: string;
  fgWarning: string;

  // Highlight syntax accents
  bgRed: string;
  bgGreen: string;
  bgBlue: string;
  bgPurple: string;
  bgTeal: string;
  bgOrange: string;

  bgGreen25: string;
  bgGreen50: string;
  bgOrange50: string;

  fgRed: string;
  fgGreen: string;
  fgBlue: string;
  fgPurple: string;
  fgTeal: string;
  fgOrange: string;
}

/**
 * Represents application Light theme.
 */
// prettier-ignore
export const lightT: IColorTheme = {
  bgDefault:  'hsl(000, 000%, 098%)', //var(--cl-bg-100)',
  bgBlur:     'hsla(000, 000%, 098%, 0.8)',
  bgInput:    'var(--cl-bg-120)',
  bgControls: 'var(--cl-bg-80)',
  bgDisabled: 'var(--cl-bg-60)',
  bgPrimary:  'var(--cl-prim-bg-100)',
  bgSelected: 'var(--cl-prim-bg-80)',
  bgActiveSelection: 'var(--cl-teal-bg-100)',
  bgHover:    'var(--cl-prim-bg-60)',
  bgWarning:  'var(--cl-red-bg-100)',
  
  border:     'var(--cl-bg-40)',

  fgDefault:  'var(--cl-fg-100)',
  fgSelected: 'var(--cl-fg-100)',
  fgDisabled: 'var(--cl-fg-80)',
  fgWarning:  'var(--cl-red-fg-100)',

  // Highlight syntax accents
  bgRed:      'hsl(000, 100%, 089%)',
  bgGreen:    'hsl(100, 100%, 075%)',
  bgBlue:     'hsl(235, 080%, 087%)',
  bgPurple:   'hsl(274, 089%, 081%)',
  bgTeal:     'hsl(192, 089%, 081%)',
  bgOrange:   'hsl(028, 100%, 075%)',

  bgGreen25:  'hsl(100, 100%, 096%)',
  bgGreen50:  'hsl(100, 100%, 090%)',
  bgOrange50: 'hsl(028, 100%, 090%)',

  fgRed:      'hsl(000, 090%, 045%)',
  fgGreen:    'hsl(100, 090%, 035%)',
  fgBlue:     'hsl(235, 100%, 050%)',
  fgPurple:   'hsl(270, 100%, 055%)',
  fgTeal:     'hsl(200, 080%, 050%)',
  fgOrange:   'hsl(030, 090%, 055%)'
};

/**
 * Represents application Dark theme.
 */
// prettier-ignore
export const darkT: IColorTheme = {
  bgDefault:  'hsl(000, 000%, 005%)', //'var(--cd-bg-100)',
  bgBlur:     'hsla(000, 000%, 005%, 0.3)',
  bgInput:    'var(--cd-bg-120)',
  bgControls: 'var(--cd-bg-80)',
  bgDisabled: 'var(--cd-bg-60)',
  bgPrimary:  'var(--cd-prim-bg-100)',
  bgSelected: 'var(--cd-prim-bg-80)',
  bgActiveSelection: 'var(--cd-teal-bg-100)',
  bgHover:    'var(--cd-prim-bg-60)',
  bgWarning:  'var(--cd-red-bg-100)',

  border:     'var(--cd-bg-40)',

  fgDefault:  'var(--cd-fg-100)',
  fgSelected: 'var(--cd-fg-100)',
  fgDisabled: 'var(--cd-fg-80)',
  fgWarning:  'var(--cd-red-fg-100)',

  // Highlight syntax accents
  bgRed:      'hsl(000, 080%, 037%)',
  bgGreen:    'hsl(100, 080%, 025%)',
  bgBlue:     'hsl(235, 054%, 049%)',
  bgPurple:   'hsl(270, 080%, 050%)',
  bgTeal:     'hsl(192, 080%, 030%)',
  bgOrange:   'hsl(035, 100%, 035%)',

  bgGreen25:  'hsl(100, 080%, 009%)',
  bgGreen50:  'hsl(100, 080%, 017%)',
  bgOrange50: 'hsl(035, 100%, 016%)',

  fgRed:      'hsl(000, 080%, 045%)',
  fgGreen:    'hsl(100, 080%, 035%)',
  fgBlue:     'hsl(235, 100%, 080%)',
  fgPurple:   'hsl(270, 100%, 080%)',
  fgTeal:     'hsl(192, 100%, 045%)',
  fgOrange:   'hsl(035, 100%, 050%)'
};

/**
 * Represents Select component Light theme.
 */
export const selectLightT = {
  primary: lightT.bgPrimary,
  primary75: lightT.bgSelected,
  primary50: lightT.bgHover,
  primary25: lightT.bgHover,

  danger: lightT.fgWarning,
  dangerLight: lightT.bgWarning,

  neutral0: lightT.bgInput,
  neutral5: lightT.bgDefault,
  neutral10: lightT.border,
  neutral20: lightT.border,
  neutral30: lightT.border,
  neutral40: lightT.fgDisabled,
  neutral50: lightT.fgDisabled, // placeholder
  neutral60: lightT.fgDefault,
  neutral70: lightT.fgWarning,
  neutral80: lightT.fgDefault,
  neutral90: lightT.fgWarning
};

/**
 * Represents Select component Dark theme.
 */
export const selectDarkT = {
  primary: darkT.bgPrimary,
  primary75: darkT.bgSelected,
  primary50: darkT.bgHover,
  primary25: darkT.bgHover,

  danger: darkT.fgWarning,
  dangerLight: darkT.bgWarning,

  neutral0: darkT.bgInput,
  neutral5: darkT.bgDefault,
  neutral10: darkT.border,
  neutral20: darkT.border,
  neutral30: darkT.border,
  neutral40: darkT.fgDisabled,
  neutral50: darkT.fgDisabled, // placeholder
  neutral60: darkT.fgDefault,
  neutral70: darkT.fgWarning,
  neutral80: darkT.fgDefault,
  neutral90: darkT.fgWarning
};

/**
 * Represents Brackets highlights Light theme.
 */
export const bracketsLightT = {
  '.cc-nonmatchingBracket': {
    color: lightT.fgRed,
    fontWeight: 600
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: lightT.bgSelected,
    color: lightT.fgSelected
  }
};

/**
 * Represents Brackets highlights Dark theme.
 */
export const bracketsDarkT = {
  '.cc-nonmatchingBracket': {
    color: darkT.fgRed,
    fontWeight: 600
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: darkT.bgSelected,
    color: darkT.fgSelected
  }
};

/**
 * Determines background color for {@link ISyntaxTreeNode} based on its type.
 */
export function colorBgSyntaxTree(node: ISyntaxTreeNode, colors: IColorTheme): string {
  switch (node.typeID) {
    case TokenID.PUNCTUATION_DEFINE:
    case TokenID.PUNCTUATION_STRUCT:
    case TokenID.ID_LOCAL:
      return colors.bgGreen;

    case TokenID.ID_GLOBAL:
    case TokenID.ID_FUNCTION:
    case TokenID.ID_PREDICATE:
    case TokenID.ID_RADICAL:
    case TokenID.LIT_INTEGER:
    case TokenID.LIT_EMPTYSET:
    case TokenID.LIT_WHOLE_NUMBERS:
      return colors.bgTeal;

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
      return colors.bgOrange;

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
      return colors.bgBlue;

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
      return colors.bgDisabled;

    case TokenID.ASSIGN:
    case TokenID.ITERATE:
      return colors.bgRed;
  }

  switch (node.data.value) {
    case 'Expression':
    case 'Local':
      return colors.bgGreen;

    case 'Global':
    case 'Radical':
    case 'Function':
    case 'Predicate':
    case 'Literal':
    case 'Integer':
    case 'EmptySet':
    case 'IntegerSet':
      return colors.bgTeal;

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
      return colors.bgBlue;

    case 'BigPr':
    case 'SmallPr':
    case 'Card':
    case 'Bool':
    case 'Debool':
    case 'Red':
    case 'PrefixD':
    case 'PrefixI':
    case 'PrefixR':
      return colors.bgPurple;

    case PARAMETER.errorNodeLabel:
      return colors.bgRed;
  }
  // node
  return colors.bgPurple;
}

/**
 * Determines background color for {@link ExpressionStatus}.
 */
export function colorBgCstStatus(status: ExpressionStatus, colors: IColorTheme): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return colors.bgGreen;
    case ExpressionStatus.INCORRECT: return colors.bgRed;
    case ExpressionStatus.INCALCULABLE: return colors.bgOrange;
    case ExpressionStatus.PROPERTY: return colors.bgTeal;
    case ExpressionStatus.UNKNOWN: return colors.bgSelected;
    case ExpressionStatus.UNDEFINED: return colors.bgBlue;
  }
}

/**
 * Determines statusbar color for {@link ExpressionStatus}.
 */
export function colorStatusBar(status: ExpressionStatus, colors: IColorTheme): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return colors.bgGreen50;
    case ExpressionStatus.INCORRECT: return colors.bgRed;
    case ExpressionStatus.INCALCULABLE: return colors.bgOrange;
    case ExpressionStatus.PROPERTY: return colors.bgTeal;
    case ExpressionStatus.UNKNOWN: return colors.bgSelected;
    case ExpressionStatus.UNDEFINED: return colors.bgBlue;
  }
}

/**
 * Determines foreground color for {@link ExpressionStatus}.
 */
export function colorFgCstStatus(status: ExpressionStatus, colors: IColorTheme): string {
  // prettier-ignore
  switch (status) {
    case ExpressionStatus.VERIFIED: return colors.fgGreen;
    case ExpressionStatus.INCORRECT: return colors.fgRed;
    case ExpressionStatus.INCALCULABLE: return colors.fgOrange;
    case ExpressionStatus.PROPERTY: return colors.fgTeal;
    case ExpressionStatus.UNKNOWN: return colors.fgBlue;
    case ExpressionStatus.UNDEFINED: return colors.fgBlue;
  }
}

/**
 * Determines background color for {@link IConstituenta} depending on its {@link CstClass}.
 */
export function colorBgCstClass(cstClass: CstClass, colors: IColorTheme): string {
  // prettier-ignore
  switch (cstClass) {
    case CstClass.BASIC: return colors.bgGreen;
    case CstClass.DERIVED: return colors.bgBlue;
    case CstClass.STATEMENT: return colors.bgRed;
    case CstClass.TEMPLATE: return colors.bgTeal;
  }
}

/**
 * Determines background color for {@link IConstituenta} depending on its parent schema index.
 */
export function colorBgSchemas(schema_index: number, colors: IColorTheme): string {
  if (schema_index === 0) {
    return colors.bgGreen;
  }
  // prettier-ignore
  switch (schema_index % 4) {
    case 1: return colors.bgPurple;
    case 2: return colors.bgOrange;
    case 3: return colors.bgTeal;
    case 0: return colors.bgBlue;
  }
  return colors.bgBlue;
}

/**
 * Determines background color for {@link GramData}.
 */
export function colorBgGrammeme(gram: GramData, colors: IColorTheme): string {
  if (PartOfSpeech.includes(gram as Grammeme)) {
    return colors.bgBlue;
  }
  if (NounGrams.includes(gram as Grammeme)) {
    return colors.bgGreen;
  }
  if (VerbGrams.includes(gram as Grammeme)) {
    return colors.bgTeal;
  }
  return colors.bgInput;
}

/**
 * Determines foreground color for {@link GramData}.
 */
export function colorFgGrammeme(gram: GramData, colors: IColorTheme): string {
  if (PartOfSpeech.includes(gram as Grammeme)) {
    return colors.fgBlue;
  }
  if (NounGrams.includes(gram as Grammeme)) {
    return colors.fgGreen;
  }
  if (VerbGrams.includes(gram as Grammeme)) {
    return colors.fgTeal;
  }
  if (!Object.values(Grammeme).includes(gram as Grammeme)) {
    return colors.fgRed;
  } else {
    return colors.fgPurple;
  }
}

/**
 * Determines graph color for {@link IConstituenta}.
 */
export function colorBgGraphNode(cst: IConstituenta, coloringScheme: GraphColoring, colors: IColorTheme): string {
  if (coloringScheme === 'type') {
    return colorBgCstClass(cst.cst_class, colors);
  }
  if (coloringScheme === 'status') {
    return colorBgCstStatus(cst.status, colors);
  }
  if (coloringScheme === 'schemas') {
    return colorBgSchemas(cst.parent_schema_index, colors);
  }
  return '';
}

/**
 * Determines m-graph color for {@link TMGraphNode}.
 */
export function colorBgTMGraphNode(node: TMGraphNode, colors: IColorTheme): string {
  if (node.rank === 0) {
    return colors.bgControls;
  }
  if (node.parents.length === 1) {
    return colors.bgTeal;
  }
  return colors.bgOrange;
}
