/**
 * Module: Transforming AST to a simple form.
 */

import { type AstNode, visitAstDFS } from '@/utils/parsing';

import { TokenID } from '../models/language';

import {
  Arguments,
  BigPr, Bool, Boolean, Card, Debool, Declaration, Declarative,
  EmptySet, Enumeration, Expression,
  Filter, Filter_expression, Function, Function_decl,
  Global, Imp_blocks, Imperative, Integer, IntegerSet,
  Local, Logic, Logic_binary, Logic_predicates,
  Logic_quantor, Logic_unary, Predicate, Radical, Recursion, Red,
  Setexpr, Setexpr_binary, Setexpr_enum_min2,
  SmallPr, Tuple, Variable, Variable_pack
} from './parser.terms';

/** Normalizes AST to a simple form. */
export function normalizeAST(ast: AstNode, input: string) {
  visitAstDFS(ast, node => normalizeNode(node, input));
}

// ====== Internals =========
const idRecord: Record<number, TokenID> = {
  [Global]: TokenID.ID_GLOBAL,
  [Local]: TokenID.ID_LOCAL,
  [Radical]: TokenID.ID_RADICAL,
  [Function]: TokenID.ID_FUNCTION,
  [Predicate]: TokenID.ID_PREDICATE,
  [Integer]: TokenID.LIT_INTEGER,
  [EmptySet]: TokenID.LIT_EMPTYSET,
  [IntegerSet]: TokenID.LIT_WHOLE_NUMBERS,

  [Boolean]: TokenID.BOOLEAN,

  [BigPr]: TokenID.BIGPR,
  [SmallPr]: TokenID.SMALLPR,
  [Filter]: TokenID.FILTER,

  [Bool]: TokenID.BOOL,
  [Debool]: TokenID.DEBOOL,
  [Red]: TokenID.REDUCE,
  [Card]: TokenID.CARD,

  [Enumeration]: TokenID.NT_ENUMERATION,
  [Tuple]: TokenID.NT_TUPLE,
  [Arguments]: TokenID.NT_ARGUMENTS,
  [Declaration]: TokenID.NT_ARG_DECL,
  [Function_decl]: TokenID.NT_FUNC_DEFINITION,
  [Variable_pack]: TokenID.NT_ENUM_DECL,
  [Declarative]: TokenID.NT_DECLARATIVE_EXPR,
  [Imperative]: TokenID.NT_IMPERATIVE_EXPR
};

function normalizeNode(node: AstNode, input: string) {
  if (node.hasError) {
    return;
  }
  switch (node.typeID) {
    case 0:
      return;

    case Expression:
      promoteSingleChild(node);
      return;

    case EmptySet:
    case IntegerSet:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      return;

    case Integer:
      node.typeID = idRecord[node.typeID];
      node.data.dataType = 'number';
      node.data.value = Number(input.slice(node.from, node.to));
      return;

    case Function:
    case Predicate:
    case Global:
    case Local:
    case Radical:
    case Integer:
      node.typeID = idRecord[node.typeID];
      node.data.dataType = 'string';
      node.data.value = input.slice(node.from, node.to);
      return;

    case Boolean:
      node.typeID = idRecord[node.typeID];
      if (node.children.length === 4) {
        node.children = [node.children[2]];
      } else {
        node.children = [node.children[1]];
      }
      clearData(node);
      return;

    case Filter:
    case BigPr:
    case SmallPr:
      node.typeID = idRecord[node.typeID];
      node.data.dataType = 'string[]';
      node.data.value = parseIndex(input.slice(node.from + 2, node.to));
      return;

    case Red:
    case Debool:
    case Bool:
    case Card:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      return;

    case Function_decl:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      node.children = [node.children[1], node.children[3]];
      return;
    case Declaration:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      node.children = [node.children[0], node.children[2]];
      return;

    case Arguments:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      if (node.children.length === 3) {
        processLeftEnum(node);
      }
      return;

    case Setexpr_enum_min2:
      processLeftEnum(node);
      return;

    case Setexpr:
      if (node.children.length === 1) {
        promoteSingleChild(node);
      } else if (node.children.length === 4) {
        processTextFunction(node);
      }
      return;

    case Tuple:
    case Enumeration:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      if (node.children[1].typeID === Setexpr_enum_min2) {
        for (const child of node.children[1].children) {
          child.parent = node;
        }
        node.children = node.children[1].children;
      } else {
        node.children = [node.children[1]];
      }
      return;

    case Logic_binary:
    case Logic_predicates:
    case Setexpr_binary:
      if (node.children[0].data.value === '(') {
        processParenthesis(node);
      } else {
        clearData(node);
        node.typeID = symbolToToken(node.children[1].data.value as string);
        if (node.typeID === TokenID.DECART) {
          processDecartChildren(node);
        } else {
          node.children = [node.children[0], node.children[2]];
        }
      }
      return;

    case Filter_expression:
      processFilter(node);
      return;

    case Logic:
      if (node.children[0].data.value === '(') {
        processParenthesis(node);
      } else {
        promoteSingleChild(node);
      }
      return;

    case Logic_unary:
      if (node.children[0].data.value === '¬') {
        clearData(node);
        node.typeID = TokenID.LOGIC_NOT;
        node.children = [node.children[1]];
      } else if (node.children[0].typeID === TokenID.ID_PREDICATE) {
        processTextFunction(node);
      } else {
        promoteSingleChild(node);
      }
      return;

    case Logic_quantor:
      clearData(node);
      node.typeID = symbolToToken(node.children[0].data.value as string);
      node.children = [node.children[1], node.children[3], node.children[4]];
      return;

    case Variable:
      if (node.children[0].typeID === TokenID.NT_TUPLE) {
        node.children[0].typeID = TokenID.NT_TUPLE_DECL;
      }
      promoteSingleChild(node);
      return;

    case Variable_pack:
      if (node.children.length === 1) {
        promoteSingleChild(node);
      } else {
        node.typeID = idRecord[node.typeID];
        processLeftEnum(node);
      }
      return;

    case Declarative:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      node.children = [node.children[2], node.children[4], node.children[6]];
      return;

    case Imp_blocks:
      if (node.children.length === 1) {
        promoteSingleChild(node);
      } else {
        processLeftEnum(node);
      }
      return;

    case Imperative:
      node.typeID = idRecord[node.typeID];
      clearData(node);
      for (const child of node.children[4].children) {
        child.parent = node;
      }
      node.children = [node.children[2], ...node.children[4].children];
      return;

    case Recursion:
      if (node.children.length > 9) {
        node.typeID = TokenID.NT_RECURSIVE_FULL;
        node.children = [node.children[2], node.children[4], node.children[6], node.children[8]];
      } else {
        node.typeID = TokenID.NT_RECURSIVE_SHORT;
        node.children = [node.children[2], node.children[4], node.children[6]];
      }
      return;
  }
}

function clearData(node: AstNode) {
  node.data.value = null;
  node.data.dataType = 'null';
}

function promoteSingleChild(node: AstNode, index: number = 0) {
  for (const child of node.children[index].children) {
    child.parent = node;
  }
  node.typeID = node.children[index].typeID;
  node.data = node.children[index].data;
  node.parenthesis = node.children[index].parenthesis;
  node.children = node.children[index].children;
}

function parseIndex(text: string): string[] {
  return text.split(',');
}

function symbolToToken(symbol: string): TokenID {
  switch (symbol) {
    case '+': return TokenID.PLUS;
    case '-': return TokenID.MINUS;
    case '*': return TokenID.MULTIPLY;

    case '∪': return TokenID.SET_UNION;
    case '\\': return TokenID.SET_MINUS;
    case '∆': return TokenID.SET_SYMMETRIC_MINUS;
    case '∩': return TokenID.SET_INTERSECTION;
    case '×': return TokenID.DECART;

    case '∈': return TokenID.SET_IN;
    case '∉': return TokenID.SET_NOT_IN;
    case '⊆': return TokenID.SUBSET_OR_EQ;
    case '⊄': return TokenID.NOT_SUBSET;
    case '⊂': return TokenID.SUBSET;

    case '>': return TokenID.GREATER;
    case '≥': return TokenID.GREATER_OR_EQ;
    case '<': return TokenID.LESSER;
    case '≤': return TokenID.LESSER_OR_EQ;

    case '≠': return TokenID.NOTEQUAL;
    case '=': return TokenID.EQUAL;

    case ':∈': return TokenID.ITERATE;
    case ':=': return TokenID.ASSIGN;

    case '¬': return TokenID.LOGIC_NOT;

    case '⇔': return TokenID.LOGIC_EQUIVALENT;
    case '⇒': return TokenID.LOGIC_IMPLICATION;
    case '∨': return TokenID.LOGIC_OR;
    case '&': return TokenID.LOGIC_AND;

    case '∀': return TokenID.QUANTOR_UNIVERSAL;
    case '∃': return TokenID.QUANTOR_EXISTS;
  }
  return TokenID.ERROR;
}

function processParenthesis(node: AstNode) {
  promoteSingleChild(node, 1);
  node.parenthesis = true;
}

function processLeftEnum(node: AstNode) {
  if (node.children[0].typeID === node.typeID) {
    for (const child of node.children[0].children) {
      child.parent = node;
    }
    node.children = [...node.children[0].children, node.children[2]];
  } else {
    node.children = [node.children[0], node.children[2]];
  }
}

function processDecartChildren(node: AstNode) {
  const newChildren: AstNode[] = [];
  if (node.children[0].typeID === TokenID.DECART && !node.children[0].parenthesis) {
    for (const child of node.children[0].children) {
      child.parent = node;
      newChildren.push(child);
    }
  } else {
    newChildren.push(node.children[0]);
  }

  if (node.children[2].typeID === TokenID.DECART && !node.children[2].parenthesis) {
    for (const child of node.children[2].children) {
      child.parent = node;
      newChildren.push(child);
    }
  } else {
    newChildren.push(node.children[2]);
  }
  node.children = newChildren;
}

function processTextFunction(node: AstNode) {
  if (node.children[0].typeID === TokenID.ID_FUNCTION || node.children[0].typeID === TokenID.ID_PREDICATE) {
    node.typeID = TokenID.NT_FUNC_CALL;
    clearData(node);
    if (node.children[2].typeID === Setexpr_enum_min2) {
      for (const child of node.children[2].children) {
        child.parent = node;
      }
      node.children = [node.children[0], ...node.children[2].children];
    } else {
      node.children = [node.children[0], node.children[2]];
    }
  } else {
    node.typeID = node.children[0].typeID;
    node.data = node.children[0].data;
    node.children = [node.children[2]];
  }
}

function processFilter(node: AstNode) {
  const children: AstNode[] = [];
  if (node.children[2].typeID === Setexpr_enum_min2) {
    for (const child of node.children[2].children) {
      child.parent = node;
      children.push(child);
    }
  } else {
    children.push(node.children[2]);
  }
  children.push(node.children[5]);
  promoteSingleChild(node);
  node.children = children;
}