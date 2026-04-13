/**
 * Module: Type auditor for AST type checking.
 */

import { type AstNode, getNodeText } from '@/utils/parsing';

import { readTypeAnnotation } from '../ast-annotations';
import { TokenID } from '../parser/token';

import { type ExpressionType } from './typification';

/** Represents function argument definition. */
export interface ArgumentsType {
  alias: string;
  type: ExpressionType | null;
}

/** Type auditor for AST type checking.
 * Warning! Assumes that the AST is well-formed and annotated with types.
 */
export class ArgumentsExtractor {
  private locals: LocalContext = new LocalContext();
  private result: ArgumentsType[] = [];

  public run(ast: AstNode): ArgumentsType[] {
    if (ast.hasError) {
      return [];
    }
    this.result = [];
    this.locals.clear();
    this.dispatchVisit(ast);
    return this.result;
  }

  private dispatchDeclare(node: AstNode): boolean {
    return this.processDeclare(node);
  }

  private processDeclare(node: AstNode): boolean {
    switch (node.typeID) {
      case TokenID.ID_LOCAL:
        return this.declareLocal(node);
      case TokenID.NT_TUPLE_DECL:
        return this.declareTuple(node);
      case TokenID.NT_ENUM_DECL:
        return this.declareEnumeration(node);
    }
    return false;
  }

  private declareLocal(node: AstNode): boolean {
    this.locals.pushLocal(node);
    return true;
  }

  private declareTuple(node: AstNode): boolean {
    for (let child = 0; child < node.children.length; child++) {
      if (!this.visitChildDeclaration(node, child)) {
        return false;
      }
    }
    return true;
  }

  private declareEnumeration(node: AstNode): boolean {
    for (const child of node.children) {
      if (!this.dispatchDeclare(child)) {
        return false;
      }
    }
    return true;
  }

  private dispatchVisit(node: AstNode): boolean {
    return this.processVisit(node);
  }

  private processVisit(node: AstNode): boolean {
    switch (node.typeID) {
      case TokenID.ID_GLOBAL:
      case TokenID.ID_FUNCTION:
      case TokenID.ID_PREDICATE:
      case TokenID.ID_RADICAL:
      case TokenID.LIT_INTEGER:
      case TokenID.LIT_WHOLE_NUMBERS:
      case TokenID.LIT_EMPTYSET:
        return true;

      case TokenID.CARD:
      case TokenID.FILTER:
      case TokenID.PLUS:
      case TokenID.MINUS:
      case TokenID.MULTIPLY:
      case TokenID.LOGIC_AND:
      case TokenID.LOGIC_OR:
      case TokenID.LOGIC_IMPLICATION:
      case TokenID.LOGIC_EQUIVALENT:
      case TokenID.EQUAL:
      case TokenID.NOTEQUAL:
      case TokenID.GREATER:
      case TokenID.LESSER:
      case TokenID.GREATER_OR_EQ:
      case TokenID.LESSER_OR_EQ:
      case TokenID.SET_IN:
      case TokenID.SET_NOT_IN:
      case TokenID.SUBSET:
      case TokenID.SUBSET_OR_EQ:
      case TokenID.NOT_SUBSET:
      case TokenID.DECART:
      case TokenID.BOOLEAN:
      case TokenID.BIGPR:
      case TokenID.SMALLPR:
      case TokenID.REDUCE:
      case TokenID.BOOL:
      case TokenID.DEBOOL:
      case TokenID.SET_UNION:
      case TokenID.SET_INTERSECTION:
      case TokenID.SET_MINUS:
      case TokenID.SET_SYMMETRIC_MINUS:
      case TokenID.LOGIC_NOT:
      case TokenID.NT_TUPLE:
      case TokenID.NT_ENUMERATION:
      case TokenID.NT_ARGUMENTS:
        return this.visitAllAndReturn(node);

      case TokenID.ID_LOCAL:
        return this.visitLocal(node);

      case TokenID.NT_ARG_DECL:
        return this.visitArgument(node);

      case TokenID.QUANTOR_UNIVERSAL:
      case TokenID.QUANTOR_EXISTS:
      case TokenID.NT_DECLARATIVE_EXPR:
        return this.visitQuantifier(node);

      case TokenID.NT_FUNC_DEFINITION:
        return this.visitFunctionDefinition(node);

      case TokenID.NT_FUNC_CALL:
        return this.visitFunctionCall(node);

      case TokenID.ITERATE:
      case TokenID.ASSIGN:
        return this.visitIterate(node);

      case TokenID.NT_IMPERATIVE_EXPR:
        return this.visitImperative(node);

      case TokenID.NT_RECURSIVE_FULL:
      case TokenID.NT_RECURSIVE_SHORT:
        return this.visitRecursion(node);
    }
    return false;
  }

  private visitChild(node: AstNode, index: number): boolean {
    return index < node.children.length && this.dispatchVisit(node.children[index]);
  }

  private visitChildDeclaration(node: AstNode, index: number): boolean {
    return index < node.children.length && this.dispatchDeclare(node.children[index]);
  }

  private visitAllAndReturn(node: AstNode): boolean {
    for (const child of node.children) {
      if (!this.dispatchVisit(child)) {
        return false;
      }
    }
    return true;
  }

  private visitLocal(node: AstNode): boolean {
    if (!this.locals.checkLocal(node)) {
      this.result.push({ alias: getNodeText(node), type: readTypeAnnotation(node) });
    }
    return true;
  }

  private visitFunctionDefinition(node: AstNode): boolean {
    this.locals.startScope();
    if (!this.visitChild(node, 0)) {
      return false;
    }
    if (!this.visitChild(node, 1)) {
      return false;
    }
    this.locals.endScope();
    return true;
  }

  private visitFunctionCall(node: AstNode): boolean {
    for (let child = 1; child < node.children.length; child++) {
      if (!this.visitChild(node, child)) {
        return false;
      }
    }
    return true;
  }

  private visitArgument(node: AstNode): boolean {
    return this.visitChild(node, 1) && this.visitChildDeclaration(node, 0);
  }

  private visitQuantifier(node: AstNode): boolean {
    this.locals.startScope();

    if (!this.visitChild(node, 1)) {
      return false;
    }
    if (!this.visitChildDeclaration(node, 0)) {
      return false;
    }
    if (!this.visitChild(node, 2)) {
      return false;
    }

    this.locals.endScope();
    return true;
  }

  private visitImperative(node: AstNode): boolean {
    this.locals.startScope();

    for (let child = 1; child < node.children.length; child++) {
      if (!this.visitChild(node, child)) {
        return false;
      }
    }

    if (!this.visitChild(node, 0)) {
      return false;
    }

    this.locals.endScope();
    return true;
  }

  private visitIterate(node: AstNode): boolean {
    return this.visitChild(node, 1) && this.visitChildDeclaration(node, 0);
  }

  private visitRecursion(node: AstNode): boolean {
    this.locals.startScope();

    if (!this.visitChild(node, 1)) {
      return false;
    }
    if (!this.visitChildDeclaration(node, 0)) {
      return false;
    }

    const isFull = node.typeID === TokenID.NT_RECURSIVE_FULL;
    const iterationIndex = isFull ? 3 : 2;

    if (!this.visitChild(node, iterationIndex)) {
      return false;
    }

    if (isFull) {
      if (!this.visitChild(node, 2)) {
        return false;
      }
    }

    this.locals.endScope();
    return true;
  }
}

// ========= Internals ========

/** Local variable data. */
interface LocalData {
  alias: string;
  level: number;
}

/** Local variables context. */
class LocalContext {
  public data: LocalData[] = [];

  clear(): void {
    this.data = [];
  }

  startScope(): void {
    for (const local of this.data) {
      if (local.level > 0) {
        local.level = local.level + 1;
      }
    }
  }

  endScope(): void {
    for (const local of this.data) {
      local.level--;
    }
  }

  clearUnused(): void {
    this.data = this.data.filter(data => data.level > 0);
  }

  pushLocal(node: AstNode) {
    const alias = getNodeText(node);
    const existing = this.data.find(data => data.alias === alias);
    if (existing) {
      if (existing.level > 0) {
        return;
      } else {
        const index = this.data.indexOf(existing);
        if (index !== -1) {
          this.data.splice(index, 1);
        }
      }
    }
    this.data.push({ alias, level: 1 });
  }

  checkLocal(node: AstNode): boolean {
    const alias = getNodeText(node);
    const local = this.data.find(data => data.alias === alias);
    return local !== undefined;
  }
}
