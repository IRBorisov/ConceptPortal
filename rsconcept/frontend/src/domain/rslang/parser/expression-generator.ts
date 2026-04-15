import { type AstNode, getNodeIndices, getNodeText } from '@/utils/parsing';

import { TokenID } from './token';

export interface ExpressionGeneratorOptions {
  normalize?: boolean;
}

/** Generates Math-syntax RS expression from AST, with optional identifier normalization. */
export function generateExpressionFromAst(ast: AstNode, options: ExpressionGeneratorOptions = {}): string {
  return new ExpressionGenerator(options).run(ast);
}

interface VisitContext {
  localDeclaration: boolean;
}

type ScopeFrame = Map<string, string>;

class ExpressionGenerator {
  private readonly options: ExpressionGeneratorOptions;
  private readonly freeLocals = new Map<string, string>();
  private readonly radicals = new Map<string, string>();
  private readonly scopes: ScopeFrame[] = [];
  private localCounter = 0;
  private radicalCounter = 0;

  constructor(options: ExpressionGeneratorOptions) {
    this.options = options;
  }

  run(ast: AstNode): string {
    if (ast.hasError) {
      return '';
    }
    return this.visit(ast, { localDeclaration: false });
  }

  private visit(node: AstNode, context: VisitContext): string {
    const shouldScope = this.shouldStartScope(node.typeID);
    if (shouldScope) {
      this.startScope();
    }

    const result = this.renderNode(node, context);

    if (shouldScope) {
      this.endScope();
    }
    return result;
  }

  private renderNode(node: AstNode, context: VisitContext): string {
    switch (node.typeID) {
      case TokenID.ID_LOCAL: {
        const alias = getNodeText(node);
        return this.options.normalize
          ? context.localDeclaration
            ? this.declareLocal(alias)
            : this.resolveLocal(alias)
          : alias;
      }
      case TokenID.ID_GLOBAL:
      case TokenID.ID_FUNCTION:
      case TokenID.ID_PREDICATE:
        return getNodeText(node);
      case TokenID.ID_RADICAL: {
        const alias = getNodeText(node);
        return this.options.normalize ? this.resolveRadical(alias) : alias;
      }
      case TokenID.LIT_INTEGER:
        return String(node.data.value);
      case TokenID.LIT_WHOLE_NUMBERS:
        return 'Z';
      case TokenID.LIT_EMPTYSET:
        return '∅';

      case TokenID.BIGPR:
        return `Pr${this.formatIndices(node)}(${this.visitChild(node, 0, context)})`;
      case TokenID.SMALLPR:
        return `pr${this.formatIndices(node)}(${this.visitChild(node, 0, context)})`;
      case TokenID.FILTER: {
        const args = node.children
          .slice(0, -1)
          .map(child => this.visit(child, context))
          .join(', ');
        const body = this.visitChild(node, node.children.length - 1, context);
        return `Fi${this.formatIndices(node)}[${args}](${body})`;
      }
      case TokenID.CARD:
        return `card(${this.visitChild(node, 0, context)})`;
      case TokenID.BOOL:
        return `bool(${this.visitChild(node, 0, context)})`;
      case TokenID.DEBOOL:
        return `debool(${this.visitChild(node, 0, context)})`;
      case TokenID.REDUCE:
        return `red(${this.visitChild(node, 0, context)})`;
      case TokenID.BOOLEAN:
        return this.renderBoolean(node, context);

      case TokenID.NT_FUNC_CALL: {
        const callee = this.visitChild(node, 0, context);
        const args = node.children
          .slice(1)
          .map(child => this.visit(child, context))
          .join(', ');
        return `${callee}[${args}]`;
      }
      case TokenID.NT_TUPLE:
        return `(${node.children.map(child => this.visit(child, context)).join(', ')})`;
      case TokenID.NT_ENUMERATION:
        return `{${node.children.map(child => this.visit(child, context)).join(', ')}}`;
      case TokenID.NT_ARGUMENTS:
      case TokenID.NT_ENUM_DECL:
        return node.children
          .map((child, index) => this.visit(child, this.childContext(node.typeID, index, context)))
          .join(', ');
      case TokenID.NT_TUPLE_DECL:
        return `(${node.children.map((child, index) => this.visit(child, this.childContext(node.typeID, index, context))).join(', ')})`;
      case TokenID.NT_ARG_DECL:
        return `${this.visitChild(node, 0, this.childContext(node.typeID, 0, context))}∈${this.visitChild(node, 1, context)}`;
      case TokenID.QUANTOR_UNIVERSAL:
        return this.renderQuantifier('∀', node, context);
      case TokenID.QUANTOR_EXISTS:
        return this.renderQuantifier('∃', node, context);
      case TokenID.NT_DECLARATIVE_EXPR:
        return `D{${this.visitChild(node, 0, this.childContext(node.typeID, 0, context))}∈${this.visitChild(node, 1, context)} | ${this.visitChild(node, 2, context)}}`;
      case TokenID.NT_FUNC_DEFINITION:
        return `[${this.visitChild(node, 0, this.childContext(node.typeID, 0, context))}] ${this.visitChild(node, 1, context)}`;
      case TokenID.ITERATE:
        return `${this.visitChild(node, 0, this.childContext(node.typeID, 0, context))}:∈${this.visitChild(node, 1, context)}`;
      case TokenID.ASSIGN:
        return `${this.visitChild(node, 0, this.childContext(node.typeID, 0, context))}:=${this.visitChild(node, 1, context)}`;
      case TokenID.NT_IMPERATIVE_EXPR: {
        const statements = node.children
          .slice(1)
          .map((child, index) => this.visit(child, this.childContext(node.typeID, index + 1, context)));
        const target = this.visitChild(node, 0, context);
        return `I{${target} | ${statements.join('; ')}}`;
      }
      case TokenID.NT_RECURSIVE_SHORT:
        return `R{${this.visitChild(node, 0, this.childContext(node.typeID, 0, context))}:=${this.visitChild(node, 1, context)} | ${this.visitChild(node, 2, context)}}`;
      case TokenID.NT_RECURSIVE_FULL:
        return `R{${this.visitChild(node, 0, this.childContext(node.typeID, 0, context))}:=${this.visitChild(node, 1, context)} | ${this.visitChild(node, 2, context)} | ${this.visitChild(node, 3, context)}}`;

      case TokenID.PLUS:
        return this.renderInfix('+', node, context);
      case TokenID.MINUS:
        return this.renderInfix('-', node, context);
      case TokenID.MULTIPLY:
        return this.renderInfix('*', node, context);
      case TokenID.GREATER:
        return this.renderInfix('>', node, context);
      case TokenID.LESSER:
        return this.renderInfix('<', node, context);
      case TokenID.GREATER_OR_EQ:
        return this.renderInfix('≥', node, context);
      case TokenID.LESSER_OR_EQ:
        return this.renderInfix('≤', node, context);
      case TokenID.EQUAL:
        return this.renderInfix('=', node, context);
      case TokenID.NOTEQUAL:
        return this.renderInfix('≠', node, context);
      case TokenID.LOGIC_AND:
        return this.renderInfix('&', node, context);
      case TokenID.LOGIC_OR:
        return this.renderInfix('∨', node, context);
      case TokenID.LOGIC_IMPLICATION:
        return this.renderInfix('⇒', node, context);
      case TokenID.LOGIC_EQUIVALENT:
        return this.renderInfix('⇔', node, context);
      case TokenID.SET_IN:
        return this.renderInfix('∈', node, context);
      case TokenID.SET_NOT_IN:
        return this.renderInfix('∉', node, context);
      case TokenID.SUBSET:
        return this.renderInfix('⊂', node, context);
      case TokenID.SUBSET_OR_EQ:
        return this.renderInfix('⊆', node, context);
      case TokenID.NOT_SUBSET:
        return this.renderInfix('⊄', node, context);
      case TokenID.DECART:
        return this.renderInfix('×', node, context);
      case TokenID.SET_UNION:
        return this.renderInfix('∪', node, context);
      case TokenID.SET_INTERSECTION:
        return this.renderInfix('∩', node, context);
      case TokenID.SET_MINUS:
        return this.renderInfix('\\', node, context);
      case TokenID.SET_SYMMETRIC_MINUS:
        return this.renderInfix('∆', node, context);
      case TokenID.LOGIC_NOT:
        return `¬${this.wrapIfNeeded(this.visitChild(node, 0, context), node.children[0])}`;
      default:
        return node.children.map(child => this.visit(child, context)).join('');
    }
  }

  private visitChild(node: AstNode, index: number, context: VisitContext): string {
    const child = node.children[index];
    if (!child) {
      return '';
    }
    return this.visit(child, this.childContext(node.typeID, index, context));
  }

  private renderQuantifier(symbol: string, node: AstNode, context: VisitContext): string {
    const declaration = this.visitChild(node, 0, this.childContext(node.typeID, 0, context));
    const domain = this.visitChild(node, 1, context);
    const bodyNode = node.children[2];
    const bodyText = this.visitChild(node, 2, context);
    const body = bodyNode && this.shouldWrapQuantifierBody(bodyNode) ? `(${bodyText})` : bodyText;
    return `${symbol}${declaration}∈${domain} ${body}`;
  }

  private shouldWrapQuantifierBody(node: AstNode): boolean {
    if (node.parenthesis) {
      return true;
    }
    return (
      node.typeID === TokenID.LOGIC_AND ||
      node.typeID === TokenID.LOGIC_OR ||
      node.typeID === TokenID.LOGIC_IMPLICATION ||
      node.typeID === TokenID.LOGIC_EQUIVALENT
    );
  }

  private renderInfix(symbol: string, node: AstNode, context: VisitContext): string {
    if (this.isLogicBinary(node.typeID)) {
      const parts = node.children.map(child => {
        const text = this.visit(child, context);
        return child.parenthesis ? `(${text})` : text;
      });
      return parts.join(` ${symbol} `);
    }
    const parts = node.children.map(child => this.wrapIfNeeded(this.visit(child, context), child));
    return parts.join(symbol);
  }

  private renderBoolean(node: AstNode, context: VisitContext): string {
    let current: AstNode = node;
    let depth = 0;
    while (current.typeID === TokenID.BOOLEAN && current.children.length === 1) {
      depth += 1;
      current = current.children[0];
    }
    return `${'ℬ'.repeat(depth)}(${this.visit(current, context)})`;
  }

  private wrapIfNeeded(text: string, node: AstNode): string {
    if (this.isAtomic(node.typeID)) {
      return text;
    }
    return `(${text})`;
  }

  private isAtomic(typeID: number): boolean {
    return (
      typeID === TokenID.ID_LOCAL ||
      typeID === TokenID.ID_GLOBAL ||
      typeID === TokenID.ID_FUNCTION ||
      typeID === TokenID.ID_PREDICATE ||
      typeID === TokenID.ID_RADICAL ||
      typeID === TokenID.LIT_INTEGER ||
      typeID === TokenID.LIT_WHOLE_NUMBERS ||
      typeID === TokenID.LIT_EMPTYSET ||
      typeID === TokenID.NT_FUNC_CALL ||
      typeID === TokenID.NT_TUPLE ||
      typeID === TokenID.NT_ENUMERATION ||
      typeID === TokenID.BIGPR ||
      typeID === TokenID.SMALLPR ||
      typeID === TokenID.FILTER ||
      typeID === TokenID.REDUCE ||
      typeID === TokenID.BOOL ||
      typeID === TokenID.DEBOOL ||
      typeID === TokenID.CARD ||
      typeID === TokenID.BOOLEAN
    );
  }

  private isLogicBinary(typeID: number): boolean {
    return (
      typeID === TokenID.LOGIC_AND ||
      typeID === TokenID.LOGIC_OR ||
      typeID === TokenID.LOGIC_IMPLICATION ||
      typeID === TokenID.LOGIC_EQUIVALENT
    );
  }

  private formatIndices(node: AstNode): string {
    return getNodeIndices(node).join(',');
  }

  private shouldStartScope(typeID: number): boolean {
    return (
      typeID === TokenID.QUANTOR_UNIVERSAL ||
      typeID === TokenID.QUANTOR_EXISTS ||
      typeID === TokenID.NT_DECLARATIVE_EXPR ||
      typeID === TokenID.NT_FUNC_DEFINITION ||
      typeID === TokenID.NT_IMPERATIVE_EXPR ||
      typeID === TokenID.NT_RECURSIVE_SHORT ||
      typeID === TokenID.NT_RECURSIVE_FULL
    );
  }

  private childContext(typeID: number, index: number, parent: VisitContext): VisitContext {
    if (!this.options.normalize) {
      return parent;
    }

    const isDeclaration =
      ((typeID === TokenID.QUANTOR_UNIVERSAL ||
        typeID === TokenID.QUANTOR_EXISTS ||
        typeID === TokenID.NT_DECLARATIVE_EXPR ||
        typeID === TokenID.ITERATE ||
        typeID === TokenID.ASSIGN ||
        typeID === TokenID.NT_RECURSIVE_SHORT ||
        typeID === TokenID.NT_RECURSIVE_FULL) &&
        index === 0) ||
      (typeID === TokenID.NT_FUNC_DEFINITION && index === 0) ||
      (typeID === TokenID.NT_ARG_DECL && index === 0) ||
      typeID === TokenID.NT_TUPLE_DECL ||
      typeID === TokenID.NT_ENUM_DECL;

    return { localDeclaration: isDeclaration };
  }

  private declareLocal(alias: string): string {
    const scope = this.currentScope();
    const local = this.nextLocal();
    scope.set(alias, local);
    return local;
  }

  private resolveLocal(alias: string): string {
    for (let index = this.scopes.length - 1; index >= 0; index -= 1) {
      const local = this.scopes[index].get(alias);
      if (local) {
        return local;
      }
    }

    let local = this.freeLocals.get(alias);
    if (!local) {
      local = this.nextLocal();
      this.freeLocals.set(alias, local);
    }
    return local;
  }

  private resolveRadical(alias: string): string {
    let radical = this.radicals.get(alias);
    if (!radical) {
      this.radicalCounter += 1;
      radical = `R${this.radicalCounter}`;
      this.radicals.set(alias, radical);
    }
    return radical;
  }

  private startScope(): void {
    this.scopes.push(new Map());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private currentScope(): ScopeFrame {
    const scope = this.scopes.at(-1);
    if (!scope) {
      throw new Error('Attempted to declare local outside of scope');
    }
    return scope;
  }

  private nextLocal(): string {
    this.localCounter += 1;
    return `a${this.localCounter}`;
  }
}
