/**
 * Module: Value auditor for AST value class checking.
 *
 * Determines whether an expression yields a concrete value (computable)
 * or a property (e.g., depends on a quantified variable).
 */

import { type AstNode, getNodeText } from '@/utils/parsing';

import { type ErrorReporter, RSErrorCode } from '../error';
import { TokenID } from '../parser/token';

import { ValueClass, type ValueClassContext } from './value-class';


/** Value auditor for AST value class checking. */
export class ValueAuditor {
  private context: ValueClassContext;
  private reporter?: ErrorReporter;

  constructor(context: ValueClassContext) {
    this.context = context;
  }

  /**
   * Runs value audit on the AST. Returns the value class on success, null on failure.
   */
  run(ast: AstNode, reporter?: ErrorReporter): ValueClass | null {
    if (ast.hasError) {
      return null;
    }
    this.reporter = reporter;
    return this.dispatchVisit(ast);
  }

  private dispatchVisit(node: AstNode): ValueClass | null {
    switch (node.typeID) {
      case TokenID.ID_GLOBAL:
      case TokenID.ID_FUNCTION:
      case TokenID.ID_PREDICATE:
        return this.visitGlobal(node);

      case TokenID.ID_LOCAL:
      case TokenID.ID_RADICAL:
      case TokenID.LIT_INTEGER:
      case TokenID.LIT_EMPTYSET:
        return ValueClass.VALUE;

      case TokenID.LIT_WHOLE_NUMBERS:
        return ValueClass.PROPERTY;

      case TokenID.NT_TUPLE_DECL:
      case TokenID.NT_ENUM_DECL:
        return this.visitAllAndReturn(node, ValueClass.VALUE);

      case TokenID.NT_ARGUMENTS:
      case TokenID.NT_ARG_DECL:
        return this.visitAllAndReturn(node, ValueClass.VALUE);

      case TokenID.PLUS:
      case TokenID.MINUS:
      case TokenID.MULTIPLY:
        return this.visitAllAndReturn(node, ValueClass.VALUE);

      case TokenID.QUANTOR_UNIVERSAL:
      case TokenID.QUANTOR_EXISTS:
        return this.visitQuantifier(node);

      case TokenID.LOGIC_NOT:
      case TokenID.LOGIC_AND:
      case TokenID.LOGIC_OR:
      case TokenID.LOGIC_IMPLICATION:
      case TokenID.LOGIC_EQUIVALENT:
        return this.visitAllAndReturn(node, ValueClass.VALUE);

      case TokenID.EQUAL:
      case TokenID.NOTEQUAL:
        return this.assertAllValues(node);

      case TokenID.GREATER:
      case TokenID.LESSER:
      case TokenID.GREATER_OR_EQ:
      case TokenID.LESSER_OR_EQ:
        return this.visitAllAndReturn(node, ValueClass.VALUE);

      case TokenID.SET_IN:
      case TokenID.SET_NOT_IN:
      case TokenID.SUBSET:
      case TokenID.SUBSET_OR_EQ:
      case TokenID.NOT_SUBSET:
        return this.visitSetexprPredicate(node);

      case TokenID.DECART:
        return this.visitDecart(node);
      case TokenID.BOOLEAN:
        return this.visitBoolean(node);

      case TokenID.NT_TUPLE:
      case TokenID.NT_ENUMERATION:
        return this.assertAllValues(node);

      case TokenID.FILTER:
        return this.visitFilter(node);

      case TokenID.CARD:
      case TokenID.BOOL:
      case TokenID.DEBOOL:
      case TokenID.BIGPR:
      case TokenID.SMALLPR:
      case TokenID.REDUCE:
        return this.assertChildIsValue(node, 0);

      case TokenID.SET_UNION:
      case TokenID.SET_INTERSECTION:
      case TokenID.SET_MINUS:
      case TokenID.SET_SYMMETRIC_MINUS:
        return this.visitSetexprBinary(node);

      case TokenID.NT_FUNC_DEFINITION:
        return this.visitFunctionDefinition(node);
      case TokenID.NT_FUNC_CALL:
        return this.visitFunctionCall(node);

      case TokenID.NT_DECLARATIVE_EXPR:
        return this.visitDeclarative(node);
      case TokenID.NT_IMPERATIVE_EXPR:
        return this.visitImperative(node);

      case TokenID.NT_RECURSIVE_FULL:
      case TokenID.NT_RECURSIVE_SHORT:
        return this.assertAllValues(node);

      case TokenID.ITERATE:
      case TokenID.ASSIGN:
        return this.visitIterateOrAssign(node);
    }
    return null;
  }

  private onError(code: RSErrorCode, position: number, params?: string[]): null {
    this.reporter?.({ code, position, params });
    return null;
  }

  private visitChild(node: AstNode, index: number): ValueClass | null {
    return this.dispatchVisit(node.children[index]);
  }

  private visitAllAndReturn(node: AstNode, value: ValueClass): ValueClass | null {
    for (const child of node.children) {
      if (this.dispatchVisit(child) === null) {
        return null;
      }
    }
    return value;
  }

  private assertChildIsValue(node: AstNode, index: number): ValueClass | null {
    const result = this.visitChild(node, index);
    if (result === null) {
      return null;
    }
    if (result !== ValueClass.VALUE) {
      const child = node.children[index];
      return this.onError(RSErrorCode.invalidPropertyUsage, child?.from ?? node.from);
    }
    return ValueClass.VALUE;
  }

  private assertAllValues(node: AstNode): ValueClass | null {
    for (let i = 0; i < node.children.length; i++) {
      if (this.assertChildIsValue(node, i) === null) {
        return null;
      }
    }
    return ValueClass.VALUE;
  }

  private visitFunctionDefinition(node: AstNode): ValueClass | null {
    if (this.visitChild(node, 0) === null) {
      return null;
    }
    return this.visitChild(node, 1);
  }

  private visitFunctionCall(node: AstNode): ValueClass | null {
    const result = this.visitChild(node, 0);
    if (result === null) {
      return null;
    }
    for (let child = 1; child < node.children.length; child++) {
      if (this.assertChildIsValue(node, child) === null) {
        return null;
      }
    }
    return result;
  }

  private visitGlobal(node: AstNode): ValueClass | null {
    const alias = getNodeText(node);
    const result = this.context.get(alias);
    if (!result || result === ValueClass.INVALID) {
      return this.onError(RSErrorCode.globalNoValue, node.from, [alias]);
    }
    return result;
  }

  private visitQuantifier(node: AstNode): ValueClass | null {
    if (this.assertChildIsValue(node, 1) === null) {
      return null;
    }
    if (this.visitChild(node, 2) === null) {
      return null;
    }
    return ValueClass.VALUE;
  }

  private visitSetexprPredicate(node: AstNode): ValueClass | null {
    const tokenId = node.typeID as TokenID;
    switch (tokenId) {
      case TokenID.SET_IN:
      case TokenID.SET_NOT_IN:
      case TokenID.SUBSET_OR_EQ:
        if (this.assertChildIsValue(node, 0) === null) {
          return null;
        }
        if (this.visitChild(node, 1) === null) {
          return null;
        }
        return ValueClass.VALUE;

      case TokenID.SUBSET:
      case TokenID.NOT_SUBSET:
        return this.assertAllValues(node);
    }
    return null;
  }

  private visitDeclarative(node: AstNode): ValueClass | null {
    if (this.visitChild(node, 2) === null) {
      return null;
    }
    return this.visitChild(node, 1);
  }

  private visitImperative(node: AstNode): ValueClass | null {
    for (let child = 1; child < node.children.length; child++) {
      if (this.visitChild(node, child) === null) {
        return null;
      }
    }
    return this.assertChildIsValue(node, 0);
  }

  private visitIterateOrAssign(node: AstNode): ValueClass | null {
    if (this.visitChild(node, 0) === null) {
      return null;
    }
    return this.assertChildIsValue(node, 1);
  }

  private visitDecart(node: AstNode): ValueClass | null {
    let result: ValueClass = ValueClass.VALUE;
    for (let child = 0; child < node.children.length; child++) {
      const childClass = this.visitChild(node, child);
      if (childClass === null) {
        return null;
      }
      if (childClass === ValueClass.PROPERTY) {
        result = ValueClass.PROPERTY;
      }
    }
    return result;
  }

  private visitBoolean(node: AstNode): ValueClass | null {
    if (this.visitChild(node, 0) === null) {
      return null;
    }
    return ValueClass.PROPERTY;
  }

  private visitFilter(node: AstNode): ValueClass | null {
    let last: ValueClass | null = null;
    for (const child of node.children) {
      last = this.dispatchVisit(child);
      if (last === null) {
        return null;
      }
    }
    return last;
  }

  private visitSetexprBinary(node: AstNode): ValueClass | null {
    const first = this.visitChild(node, 0);
    if (first === null) {
      return null;
    }
    const second = this.visitChild(node, 1);
    if (second === null) {
      return null;
    }
    const isValue = combineOperationValues(
      node.typeID as TokenID,
      first === ValueClass.VALUE,
      second === ValueClass.VALUE
    );
    return isValue ? ValueClass.VALUE : ValueClass.PROPERTY;
  }
}

// ====== Internals ======

/** Combines value flags for set operations. */
function combineOperationValues(op: TokenID, v1: boolean, v2: boolean): boolean {
  switch (op) {
    case TokenID.SET_SYMMETRIC_MINUS:
    case TokenID.SET_UNION:
      return v1 && v2;
    case TokenID.SET_INTERSECTION:
      return v1 || v2;
    case TokenID.SET_MINUS:
      return v1;
    default:
      return v1 && v2;
  }
}
