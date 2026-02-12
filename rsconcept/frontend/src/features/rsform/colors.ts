import { APP_COLORS } from '@/styling/colors';
import { type FlatAstNode } from '@/utils/parsing';

import { TokenID } from '../rslang';

import { type Constituenta, CstClass, CstStatus } from './models/rsform';
import { type TypificationNodeData } from './models/typification-graph';
import { TGColoring, TGEdgeType } from './stores/term-graph';

/** Represents Brackets highlights theme. */
export const BRACKETS_THEME = {
  '.cc-nonmatchingBracket': {
    color: APP_COLORS.fgRed,
    fontWeight: 600
  },
  '&.cm-focused .cc-matchingBracket': {
    backgroundColor: APP_COLORS.bgSelected,
    color: APP_COLORS.fgSelected
  }
} as const;

/** Determines background color for {@link FlatAstNode} based on its type. */
export function colorBgSyntaxTree(node: FlatAstNode): string {
  switch (node.typeID) {
    case TokenID.ERROR:
      return APP_COLORS.bgRed;

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
      return APP_COLORS.bgControls;

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
  }
  // node
  return APP_COLORS.bgPurple;
}

/** Determines background color for {@link CstStatus}. */
export function colorBgCstStatus(status: CstStatus): string {
  // prettier-ignore
  switch (status) {
    case CstStatus.VERIFIED: return APP_COLORS.bgGreen;
    case CstStatus.INCORRECT: return APP_COLORS.bgRed;
    case CstStatus.INCALCULABLE: return APP_COLORS.bgOrange;
    case CstStatus.PROPERTY: return APP_COLORS.bgTeal;
    case CstStatus.UNKNOWN: return APP_COLORS.bgSelected;
    case CstStatus.UNDEFINED: return APP_COLORS.bgBlue;
  }
}

/** Determines statusbar color for {@link CstStatus}. */
export function colorStatusBar(status: CstStatus): string {
  // prettier-ignore
  switch (status) {
    case CstStatus.VERIFIED: return APP_COLORS.bgGreen50;
    case CstStatus.INCORRECT: return APP_COLORS.bgRed;
    case CstStatus.INCALCULABLE: return APP_COLORS.bgOrange;
    case CstStatus.PROPERTY: return APP_COLORS.bgTeal;
    case CstStatus.UNKNOWN: return APP_COLORS.bgSelected;
    case CstStatus.UNDEFINED: return APP_COLORS.bgBlue;
  }
}

/** Determines foreground color for {@link CstStatus}. */
export function colorFgCstStatus(status: CstStatus): string {
  // prettier-ignore
  switch (status) {
    case CstStatus.VERIFIED: return APP_COLORS.fgGreen;
    case CstStatus.INCORRECT: return APP_COLORS.fgRed;
    case CstStatus.INCALCULABLE: return APP_COLORS.fgOrange;
    case CstStatus.PROPERTY: return APP_COLORS.fgTeal;
    case CstStatus.UNKNOWN: return APP_COLORS.fgBlue;
    case CstStatus.UNDEFINED: return APP_COLORS.fgBlue;
  }
}

/** Determines background color for {@link Constituenta} depending on its {@link CstClass}. */
export function colorBgCstClass(cstClass: CstClass): string {
  // prettier-ignore
  switch (cstClass) {
    case CstClass.NOMINAL: return APP_COLORS.bgOrange;
    case CstClass.BASIC: return APP_COLORS.bgGreen;
    case CstClass.DERIVED: return APP_COLORS.bgBlue;
    case CstClass.STATEMENT: return APP_COLORS.bgRed;
    case CstClass.TEMPLATE: return APP_COLORS.bgPurple;
  }
}

/** Determines background color for {@link Constituenta} badge. */
export function colorBgBadge(item: Constituenta) {
  switch (item.cst_class) {
    case CstClass.BASIC:
      return 'bg-accent-green25';
  }
  return 'bg-input';
}

/** Determines background color for {@link Constituenta} depending on its parent schema index. */
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

/** Determines graph color for {@link Constituenta}. */
export function colorBgGraphNode(cst: Constituenta, coloringScheme: TGColoring): string {
  if (coloringScheme === TGColoring.type) {
    return colorBgCstClass(cst.cst_class);
  }
  if (coloringScheme === TGColoring.status) {
    return colorBgCstStatus(cst.status);
  }
  if (coloringScheme === TGColoring.schemas) {
    return colorBgSchemas(cst.parent_schema_index);
  }
  return APP_COLORS.bgGreen50;
}

/** Determines m-graph color for {@link TypificationNodeData}. */
export function colorBgTMGraphNode(node: TypificationNodeData): string {
  if (node.rank === 0) {
    return APP_COLORS.bgControls;
  }
  if (node.parents.length === 1) {
    return APP_COLORS.bgTeal;
  }
  return APP_COLORS.bgOrange;
}

export function colorGraphEdge(edgeType: TGEdgeType): string {
  switch (edgeType) {
    case TGEdgeType.full:
      return APP_COLORS.bgGreen;
    case TGEdgeType.definition:
      return APP_COLORS.border;
    case TGEdgeType.attribution:
      return APP_COLORS.bgPurple;
  }
}
