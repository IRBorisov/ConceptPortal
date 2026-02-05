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

  private current: ValueClass | null = null;

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
    this.clear();
    const success = this.dispatchVisit(ast);
    if (!success) {
      return null;
    }
    return this.current;
  }

  private clear(): void {
    this.current = null;
  }

  private dispatchVisit(node: AstNode): boolean {
    switch (node.typeID) {
      case TokenID.ID_GLOBAL:
      case TokenID.ID_FUNCTION:
      case TokenID.ID_PREDICATE:
        return this.visitGlobal(node);

      case TokenID.ID_LOCAL:
      case TokenID.ID_RADICAL:
        return this.setCurrent(ValueClass.VALUE);

      case TokenID.LIT_INTEGER:
      case TokenID.LIT_EMPTYSET:
        return this.setCurrent(ValueClass.VALUE);
      case TokenID.LIT_WHOLE_NUMBERS:
        return this.setCurrent(ValueClass.PROPERTY);

      case TokenID.NT_TUPLE_DECL:
      case TokenID.NT_ENUM_DECL:
        return this.visitAllChildrenAndSetCurrent(node, ValueClass.VALUE);

      case TokenID.NT_ARGUMENTS:
      case TokenID.NT_ARG_DECL:
        return this.visitAllChildren(node);

      case TokenID.PLUS:
      case TokenID.MINUS:
      case TokenID.MULTIPLY:
        return this.visitAllChildrenAndSetCurrent(node, ValueClass.VALUE);

      case TokenID.QUANTOR_UNIVERSAL:
      case TokenID.QUANTOR_EXISTS:
        return this.visitQuantifier(node);

      case TokenID.LOGIC_NOT:
      case TokenID.LOGIC_AND:
      case TokenID.LOGIC_OR:
      case TokenID.LOGIC_IMPLICATION:
      case TokenID.LOGIC_EQUIVALENT:
        return this.visitAllChildrenAndSetCurrent(node, ValueClass.VALUE);

      case TokenID.EQUAL:
      case TokenID.NOTEQUAL:
        return this.assertAllValues(node);

      case TokenID.GREATER:
      case TokenID.LESSER:
      case TokenID.GREATER_OR_EQ:
      case TokenID.LESSER_OR_EQ:
        return this.visitAllChildrenAndSetCurrent(node, ValueClass.VALUE);

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
        return this.visitAllChildren(node);

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
        return this.visitAllChildren(node);
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
        return this.assertChildIsValue(node, 1);

      default:
        return false;
    }
  }

  private setCurrent(value: ValueClass | null): boolean {
    this.current = value;
    return true;
  }

  private onError(code: RSErrorCode, position: number, params?: string[]): boolean {
    if (this.reporter) {
      this.reporter({ code, position, params });
    }
    return false;
  }

  private visitChild(node: AstNode, index: number): boolean {
    if (index >= node.children.length) {
      return false;
    }
    return this.dispatchVisit(node.children[index]);
  }

  private visitAllChildren(node: AstNode): boolean {
    for (const child of node.children) {
      if (!this.dispatchVisit(child)) {
        return false;
      }
    }
    return true;
  }

  private visitAllChildrenAndSetCurrent(node: AstNode, value: ValueClass): boolean {
    return this.visitAllChildren(node) && this.setCurrent(value);
  }

  private assertChildIsValue(node: AstNode, index: number): boolean {
    if (!this.visitChild(node, index)) {
      return false;
    }
    if (this.current !== ValueClass.VALUE) {
      const child = node.children[index];
      return this.onError(RSErrorCode.invalidPropertyUsage, child?.from ?? node.from);
    }
    return true;
  }

  private assertAllValues(node: AstNode): boolean {
    for (let i = 0; i < node.children.length; i++) {
      if (!this.assertChildIsValue(node, i)) {
        return false;
      }
    }
    return true;
  }

  private visitFunctionCall(node: AstNode): boolean {
    if (!this.visitChild(node, 0)) {
      return false;
    }
    const result = this.current;
    for (let child = 1; child < node.children.length; child++) {
      this.assertChildIsValue(node, child);
    }
    return this.setCurrent(result);
  }

  private visitGlobal(node: AstNode): boolean {
    const alias = getNodeText(node);
    const result = this.context.get(alias);
    if (!result || result === ValueClass.INVALID) {
      return this.onError(RSErrorCode.globalNoValue, node.from, [alias]);
    }
    return this.setCurrent(result);
  }

  private visitQuantifier(node: AstNode): boolean {
    return this.assertChildIsValue(node, 1) && this.visitChild(node, 2);
  }

  private visitSetexprPredicate(node: AstNode): boolean {
    const tokenId = node.typeID as TokenID;
    switch (tokenId) {
      case TokenID.SET_IN:
      case TokenID.SET_NOT_IN:
      case TokenID.SUBSET_OR_EQ:
        return this.visitChild(node, 1) && this.assertChildIsValue(node, 0);

      case TokenID.SUBSET:
      case TokenID.NOT_SUBSET:
        return this.assertAllValues(node);

      default:
        return this.visitChild(node, 1) && this.assertChildIsValue(node, 0);
    }
  }

  private visitDeclarative(node: AstNode): boolean {
    return this.visitChild(node, 2) && this.visitChild(node, 1);
  }

  private visitImperative(node: AstNode): boolean {
    for (let child = 1; child < node.children.length; child++) {
      if (!this.visitChild(node, child)) {
        return false;
      }
    }
    return this.assertChildIsValue(node, 0);
  }

  private visitDecart(node: AstNode): boolean {
    let type: ValueClass = ValueClass.VALUE;
    for (let child = 0; child < node.children.length; child++) {
      if (!this.visitChild(node, child)) {
        return false;
      }
      if (this.current === ValueClass.PROPERTY) {
        type = ValueClass.PROPERTY;
      }
    }
    return this.setCurrent(type);
  }

  private visitBoolean(node: AstNode): boolean {
    return this.visitChild(node, 0) && this.setCurrent(ValueClass.PROPERTY);
  }

  private visitSetexprBinary(node: AstNode): boolean {
    if (!this.visitChild(node, 0)) {
      return false;
    }
    const firstValue = this.current === ValueClass.VALUE;

    if (!this.visitChild(node, 1)) {
      return false;
    }
    const secondValue = this.current === ValueClass.VALUE;

    if (combineOperationValues(node.typeID as TokenID, firstValue, secondValue)) {
      return this.setCurrent(ValueClass.VALUE);
    }
    return this.setCurrent(ValueClass.PROPERTY);
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
