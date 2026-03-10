/**
 * Module: API for calculations.
 */

import { type AstNode } from '@/utils/parsing';

import { type RSErrorDescription } from '../error';

import { type ASTContext, Evaluator } from './evaluator';
import { type Value, type ValueContext } from './value';

/** Maximum iterations to prevent infinite loops (recursion, quantifiers, etc.). */
export const MAX_ITERATIONS = 100_000;

/** Result of calculator evaluation. */
export interface CalculatorResult {
  value: Value | null;
  iterations: number;
  errors: RSErrorDescription[];
}


type Listener = () => void;

/** AST calculator - evaluates RS expressions via visitor pattern and provides updates via listeners. */
export class RSCalculator {
  private context: ValueContext = new Map();
  private treeContext: ASTContext = new Map();
  private evaluator: Evaluator = new Evaluator(this.context, this.treeContext);

  private listeners = new Map<string, Set<Listener>>();

  subscribe = (alias: string, listener: Listener) => {
    let notifyList = this.listeners.get(alias);

    if (!notifyList) {
      notifyList = new Set();
      this.listeners.set(alias, notifyList);
    }

    notifyList.add(listener);
    return () => {
      notifyList.delete(listener);
      if (notifyList.size === 0) {
        this.listeners.delete(alias);
      }
    };
  };

  private notify(alias: string) {
    const set = this.listeners.get(alias);
    if (!set) return;

    for (const l of set) {
      l();
    }
  }

  public setValue(alias: string, value: Value): void {
    this.context.set(alias, value);
    this.notify(alias);
  }

  public resetValue(alias: string): void {
    this.context.delete(alias);
    this.notify(alias);
  }

  public getValue(alias: string): Value | null {
    return this.context.get(alias) ?? null;
  }

  public setAST(alias: string, ast: AstNode): void {
    this.treeContext.set(alias, ast);
  }

  public evaluateFast(ast: AstNode): Value | null {
    if (ast.hasError) {
      return null;
    }
    return this.evaluator.run(ast);
  }

  public evaluateFull(ast: AstNode): CalculatorResult {
    const errors: RSErrorDescription[] = [];
    const reporter = (error: RSErrorDescription) => {
      errors.push(error);
    };

    if (ast.hasError) {
      return { value: null, iterations: 0, errors };
    }

    const value = this.evaluator.run(ast, reporter);
    return {
      value,
      iterations: this.evaluator.iterationCounter,
      errors
    };
  }
}