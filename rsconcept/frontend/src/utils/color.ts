/**
 * Module: Single place for all color definitions in code (see index.css for full defs).
 */

import { GramData, Grammeme, NounGrams, PartOfSpeech, VerbGrams } from '../models/language';
import { GraphColoringScheme } from '../models/miscelanious';
import { CstClass, ExpressionStatus, IConstituenta } from '../models/rsform';
import { ISyntaxTreeNode, TokenID } from '../models/rslang';


/**
 * Represents application color theme configuration.
 */
export interface IColorTheme {  
  bgDefault: string
  bgInput: string
  bgControls: string
  bgDisabled: string
  bgPrimary: string
  bgSelected: string
  bgHover: string
  bgWarning: string
  
  border: string

  fgDefault: string
  fgSelected: string
  fgDisabled: string
  fgWarning: string

  // Hightlight syntax accents
  bgRed: string
  bgGreen: string
  bgBlue: string
  bgPurple: string
  bgTeal: string
  bgOrange: string

  fgRed: string
  fgGreen: string
  fgBlue: string
  fgPurple: string
  fgTeal: string
  fgOrange: string
}

/**
 * Represents application Light theme.
 */
export const lightT: IColorTheme = {
  bgDefault:  'var(--cl-bg-100)',
  bgInput:    'var(--cl-bg-120)',
  bgControls: 'var(--cl-bg-80)',
  bgDisabled: 'var(--cl-bg-60)',
  bgPrimary:  'var(--cl-prim-bg-100)',
  bgSelected: 'var(--cl-prim-bg-80)',
  bgHover:    'var(--cl-prim-bg-60)',
  bgWarning:  'var(--cl-red-bg-100)',
  
  border:     'var(--cl-bg-40)',

  fgDefault:  'var(--cl-fg-100)',
  fgSelected: 'var(--cl-fg-100)',
  fgDisabled: 'var(--cl-fg-80)',
  fgWarning:  'var(--cl-red-fg-100)',

  // Hightlight syntax accents
  bgRed:      'hsl(000, 100%, 089%)',
  bgGreen:    'hsl(100, 100%, 075%)',
  bgBlue:     'hsl(235, 080%, 087%)',
  bgPurple:   'hsl(274, 089%, 081%)',
  bgTeal:     'hsl(192, 089%, 081%)',
  bgOrange:   'hsl(028, 100%, 075%)',

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
export const darkT: IColorTheme = {
  bgDefault:  'var(--cd-bg-100)',
  bgInput:    'var(--cd-bg-120)',
  bgControls: 'var(--cd-bg-80)',
  bgDisabled: 'var(--cd-bg-60)',
  bgPrimary:  'var(--cd-prim-bg-100)',
  bgSelected: 'var(--cd-prim-bg-80)',
  bgHover:    'var(--cd-prim-bg-60)',
  bgWarning:  'var(--cd-red-bg-100)',

  border:     'var(--cd-bg-40)',

  fgDefault:  'var(--cd-fg-100)',
  fgSelected: 'var(--cd-fg-100)',
  fgDisabled: 'var(--cd-fg-80)',
  fgWarning:  'var(--cd-red-fg-100)',

  // Hightlight syntax accents
  bgRed:      'hsl(000, 080%, 037%)',
  bgGreen:    'hsl(100, 080%, 025%)',
  bgBlue:     'hsl(235, 054%, 049%)',
  bgPurple:   'hsl(270, 080%, 050%)',
  bgTeal:     'hsl(192, 080%, 030%)',
  bgOrange:   'hsl(035, 100%, 035%)',

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
}

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
}

/**
 * Represents Graph component Light theme.
 */
export const graphLightT = {
  canvas: {
    background: '#f9fafb',
  },
  node: {
    fill: '#7ca0ab',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
        color: '#2A6475',
        stroke: '#fff',
        activeColor: '#1DE9AC'
    }
  },
  lasso: {
    border: '1px solid #55aaff',
    background: 'rgba(75, 160, 255, 0.1)'
  },
  ring: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: '#fff',
      color: '#2A6475',
      activeColor: '#1DE9AC'
    }
  },
  arrow: {
    fill: '#D8E6EA',
    activeFill: '#1DE9AC'
  },
  cluster: {
    stroke: '#D8E6EA',
    label: {
      stroke: '#fff',
      color: '#2A6475'
    }
  }
}

/**
 * Represents Graph component Dark theme.
 */
export const graphDarkT = {
  canvas: {
    background: '#171717' // var(--cd-bg-100)
  },
  node: {
    fill: '#7a8c9e',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.2,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
    }
  },
  lasso: {
    border: '1px solid #55aaff',
    background: 'rgba(75, 160, 255, 0.1)'
  },
  ring: {
    fill: '#54616D',
    activeFill: '#1DE9AC'
  },
  edge: {
    fill: '#474B56',
    activeFill: '#1DE9AC',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7',
      activeColor: '#1DE9AC'
    }
  },
  arrow: {
    fill: '#474B56',
    activeFill: '#1DE9AC'
  },
  cluster: {
    stroke: '#474B56',
    label: {
      stroke: '#1E2026',
      color: '#ACBAC7'
    }
  }
}

/**
 * Represents Brackets highlights Light theme.
 */
export const bracketsLightT = {
  '.cc-nonmatchingBracket': {
    color: lightT.fgRed,
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: lightT.bgSelected,
    color: lightT.fgSelected
  },
};

/**
 * Represents Brackets highlights Dark theme.
 */
export const bracketsDarkT = {
  '.cc-nonmatchingBracket': {
    color: darkT.fgRed,
    fontWeight: 700,
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: darkT.bgSelected,
    color: darkT.fgSelected
  },
};

/**
 * Determines background color for {@link ISyntaxTreeNode} based on its type.
 */
export function colorbgSyntaxTree(node: ISyntaxTreeNode, colors: IColorTheme): string {
  switch (node.typeID) {
  case TokenID.PUNC_DEFINE:
  case TokenID.PUNC_STRUCT:
  case TokenID.ID_LOCAL:
    return colors.bgGreen;

  case TokenID.ID_GLOBAL:
  case TokenID.ID_FUNCTION:
  case TokenID.ID_PREDICATE:
  case TokenID.ID_RADICAL:
  case TokenID.LIT_INTEGER:
  case TokenID.LIT_EMPTYSET:
  case TokenID.LIT_INTSET:
    return colors.bgTeal;

  case TokenID.FORALL:
  case TokenID.EXISTS:
  case TokenID.NOT:
  case TokenID.AND:
  case TokenID.OR:
  case TokenID.IMPLICATION:
  case TokenID.EQUIVALENT:
  case TokenID.GREATER:
  case TokenID.LESSER:
  case TokenID.EQUAL:
  case TokenID.NOTEQUAL:
  case TokenID.GREATER_OR_EQ:
  case TokenID.LESSER_OR_EQ:
  case TokenID.IN:
  case TokenID.NOTIN:
  case TokenID.SUBSET_OR_EQ:
  case TokenID.SUBSET:
  case TokenID.NOTSUBSET:
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
  case TokenID.INTERSECTION:
  case TokenID.UNION:
  case TokenID.SET_MINUS:
  case TokenID.SYMMINUS:
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
  case TokenID.NT_IMP_DECLARE:
  case TokenID.NT_IMP_ASSIGN:
  case TokenID.NT_IMP_LOGIC:
  case TokenID.NT_RECURSIVE_SHORT:
    return '';

  case TokenID.PUNC_ASSIGN:
  case TokenID.PUNC_ITERATE:
    return colors.bgRed;
  }
  // node
  return colors.bgRed;
}

/**
 * Determines background color for {@link ExpressionStatus}.
 */
export function colorbgCstStatus(status: ExpressionStatus, colors: IColorTheme): string {
  switch (status) {
    case ExpressionStatus.VERIFIED: return colors.bgGreen;
    case ExpressionStatus.INCORRECT: return colors.bgRed;
    case ExpressionStatus.INCALCULABLE: return colors.bgOrange;
    case ExpressionStatus.PROPERTY: return colors.bgTeal;
    case ExpressionStatus.UNKNOWN: return colors.bgBlue;
    case ExpressionStatus.UNDEFINED: return colors.bgBlue;
  }
}

/**
 * Determines foreground color for {@link ExpressionStatus}.
 */
export function colorfgCstStatus(status: ExpressionStatus, colors: IColorTheme): string {
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
export function colorbgCstClass(cstClass: CstClass, colors: IColorTheme): string {
  switch (cstClass) {
    case CstClass.BASIC: return colors.bgGreen;
    case CstClass.DERIVED: return colors.bgBlue;
    case CstClass.STATEMENT: return colors.bgRed;
    case CstClass.TEMPLATE: return colors.bgTeal;
  }
}

/**
 * Determines background color for {@link GramData}.
 */
export function colorbgGrammeme(gram: GramData, colors: IColorTheme): string {
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
export function colorfgGrammeme(gram: GramData, colors: IColorTheme): string {
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
export function colorbgGraphNode(cst: IConstituenta, coloringScheme: GraphColoringScheme, colors: IColorTheme): string {
  if (coloringScheme === 'type') {
    return colorbgCstClass(cst.cst_class, colors);
  }
  if (coloringScheme === 'status') {
    return colorbgCstStatus(cst.status, colors);
  }
  return '';
}