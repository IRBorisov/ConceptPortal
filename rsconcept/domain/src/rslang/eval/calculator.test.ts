import { beforeEach, describe, expect, it } from 'vitest';

import { type AstNode, buildTree } from '../../parsing';
import { RSErrorCode } from '../error';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';

import { type CalculatorResult, RSCalculator } from './calculator';
import { createModelValueArray } from './model-value-arrays';
import { tryEvaluateNoReturn } from './relation-closure';
import { tuple, TUPLE_ID, type Value } from './value';
import { printValue } from './value-api';

function buildAST(expression: string): AstNode {
  const tree = rslangParser.parse(expression);
  const ast = buildTree(tree.cursor());
  normalizeAST(ast, expression);
  return ast;
}

describe('RSCalculator', () => {
  let calculator: RSCalculator;
  const graphBudget = { limit: 1000, call: 3, recursion: 3, quantifier: 1 };
  const isolatedRoots = [7, 8, 9, 10, 11, 12, 13, 14];

  function modelArray(...elements: Value[]): Value[] {
    const array = createModelValueArray(elements.length);
    elements.forEach((element, index) => {
      array[index] = element;
    });
    return array;
  }

  function modelEdge(left: number, right: number): Value[] {
    return modelArray(TUPLE_ID, left, right);
  }

  beforeEach(() => {
    calculator = new RSCalculator();
    calculator.setValue('X1', [1, 2, 3]);
    calculator.setValue('C1', [10, 20, 30]);
    calculator.setAST('S1', buildAST('ℬ(X1)'));
    calculator.setAST('D1', buildAST('X1'));
  });

  function expectCalcValue(expr: string, expected: string) {
    const ast = buildAST(expr);
    expect(ast.hasError).toBe(false);
    const value = calculator.evaluateFast(ast);
    expect(printValue(value)).toBe(expected);
  }

  function expectCalcFull(expr: string, options?: { expectValue?: string; expectErrorCode?: RSErrorCode }) {
    const ast = buildAST(expr);
    expect(ast.hasError).toBe(false);
    const result: CalculatorResult = calculator.evaluateFull(ast);
    if (options?.expectValue !== undefined) {
      expect(printValue(result.value)).toBe(options.expectValue);
      expect(result.errors.length).toBe(0);
    }
    if (options?.expectErrorCode !== undefined) {
      expect(result.value).toBe(null);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe(options.expectErrorCode);
    }
  }

  it('returns null value on syntax error', () => {
    // Introduce an invalid expression: should set hasError and return null value
    const ast = buildAST('a ==='); // Invalid
    // Manually setting hasError for testing, because buildAST may not do this
    ast.hasError = true;
    expect(calculator.evaluateFast(ast)).toBe(null);
    expect(calculator.evaluateFull(ast).value).toBe(null);
  });

  it('handles a caller-provided root token getter in the ordinary evaluator', () => {
    const ast = buildAST('1+1');
    expect(calculator.evaluateFast(ast)).toBe(2);
    Object.defineProperty(ast, 'typeID', {
      get() {
        throw new Error('token unavailable');
      }
    });
    expect(calculator.evaluateFast(ast)).toBeNull();
  });

  it('evaluates a simple constant', () => {
    expectCalcValue('1', '1');
  });

  it('evaluates a variable from context', () => {
    expectCalcValue('X1', '{1, 2, 3}');
  });

  it('evaluates a basic set operation', () => {
    expectCalcValue('{2,3,4}∩{2,3,5}', '{2, 3}');
  });

  function loadRelationClosure() {
    const functions = new Map([
      ['F11', buildAST('[z∈X4] R{w:=F14[z] | F15[w]∪w}')],
      ['F14', buildAST('[v∈X4] Pr1(Fi2[{v}](S5))')],
      ['F15', buildAST('[v∈ℬ(X4)] Pr1(Fi2[v](S5))')]
    ]);
    for (const [alias, ast] of functions) {
      calculator.setAST(alias, ast);
    }
    return { functions, assertion: buildAST('∀u∈X4 u∉F11[u]') };
  }

  it('lowers universal no-return assertions with arbitrary aliases and columns', () => {
    const { functions, assertion } = loadRelationClosure();
    const relation = modelArray(modelEdge(1, 2), modelEdge(3, 1), modelEdge(2, 3), modelEdge(1, 4), modelEdge(6, 6));
    calculator.setValue('S5', relation);
    for (const [domain, expected] of [
      [[], 1],
      [[4, 5, ...isolatedRoots], 1],
      [[1, 5, ...isolatedRoots], 0],
      [[6, ...isolatedRoots], 0]
    ] as const) {
      const roots = modelArray(...domain);
      calculator.setValue('X4', roots);
      expect(tryEvaluateNoReturn(assertion, alias => calculator.getValue(alias), functions, graphBudget)).toBe(
        expected
      );
      expect(calculator.evaluateFast(assertion)).toBe(expected);
      expect(calculator.evaluateFull(assertion)).toMatchObject({ value: expected, errors: [] });
    }
    calculator.setValue('X4', modelArray(1, 5, ...isolatedRoots));
    expect(
      tryEvaluateNoReturn(assertion, alias => calculator.getValue(alias), functions, { ...graphBudget, limit: 1 })
    ).toBeNull();
    calculator.setValue('S5', modelArray(...relation, modelArray(TUPLE_ID, [2], 1)));
    expect(tryEvaluateNoReturn(assertion, alias => calculator.getValue(alias), functions, graphBudget)).toBeNull();
    expect(calculator.evaluateFast(assertion)).toBeNull();
    expect(calculator.evaluateFull(assertion).errors[0]?.code).toBe(RSErrorCode.calcInvalidData);
  });

  it('leaves relation iterators to the ordinary evaluator', () => {
    const { assertion, functions } = loadRelationClosure();
    const relation = modelArray(modelEdge(2, 1));
    const edges = [tuple([1, 1])];
    Object.defineProperty(relation, Symbol.iterator, { value: edges[Symbol.iterator].bind(edges) });
    calculator.setValue('X4', modelArray(1, ...isolatedRoots));
    calculator.setValue('S5', relation);

    expect(tryEvaluateNoReturn(assertion, alias => calculator.getValue(alias), functions, graphBudget)).toBeNull();
    expect(calculator.evaluateFast(assertion)).toBe(0);
    expect(calculator.evaluateFull(assertion)).toMatchObject({ value: 0, errors: [] });
  });

  it('preserves repeated reads of accessor-backed projection fields', () => {
    const { assertion, functions } = loadRelationClosure();
    let reads = 0;
    const changingEdge = modelEdge(3, 2);
    Object.defineProperty(changingEdge, 1, { get: () => (++reads === 1 ? 3 : 1) });
    calculator.setValue('X4', modelArray(1, ...isolatedRoots));
    calculator.setValue('S5', modelArray(modelEdge(2, 1), changingEdge));

    expect(tryEvaluateNoReturn(assertion, alias => calculator.getValue(alias), functions, graphBudget)).toBeNull();
    expect(reads).toBe(0);
    expect(calculator.evaluateFast(assertion)).toBe(0);
    expect(reads).toBeGreaterThan(1);
  });

  it('keeps caller-provided proxy domains on the interpreter path', () => {
    const { assertion } = loadRelationClosure();
    calculator.setValue('S5', modelArray(modelEdge(2, 2)));
    calculator.setValue(
      'X4',
      new Proxy(modelArray(1), {
        get: (target, key, receiver) => (key === '0' ? 2 : (Reflect.get(target, key, receiver) as Value))
      })
    );

    expect(calculator.evaluateFast(assertion)).toBe(0);
    expect(calculator.evaluateFull(assertion)).toMatchObject({ value: 0, errors: [] });
  });

  it('leaves narrow quantifiers over large relations to the ordinary evaluator', () => {
    const { assertion, functions } = loadRelationClosure();
    const relation = modelArray(...Array.from({ length: 320 }, (_, index) => modelEdge(index + 21, index + 20)));
    calculator.setValue('S5', relation);
    for (const roots of [[1], isolatedRoots]) {
      calculator.setValue('X4', modelArray(...roots));
      expect(tryEvaluateNoReturn(assertion, alias => calculator.getValue(alias), functions, graphBudget)).toBeNull();
      expect(calculator.evaluateFast(assertion)).toBe(1);
    }
  });

  it('projects distinct nested values in canonical order and retains the first equal value', () => {
    const first = [1];
    const duplicate = [1];
    const second = [2, 3];
    const relation = [tuple([1, second]), tuple([2, first]), tuple([3, duplicate])];
    calculator.setValue('S2', relation);

    const result = calculator.evaluateFull(buildAST('Pr2(S2)'));

    expect(result.errors).toEqual([]);
    expect(result.value).toEqual([first, second]);
    expect(Array.isArray(result.value) && result.value[0]).toBe(first);
    expect(relation).toEqual([tuple([1, [2, 3]]), tuple([2, [1]]), tuple([3, [1]])]);
  });

  it('returns error for unknown variable', () => {
    expectCalcFull('X11', { expectErrorCode: RSErrorCode.calcGlobalMissing });
  });

  it('returns error for undeclared local variable', () => {
    expectCalcFull('∀a∈X1 b=b', { expectErrorCode: RSErrorCode.localUndeclared });
  });

  it('returns error for incompatible value comparison', () => {
    expectCalcFull('X1=1', { expectErrorCode: RSErrorCode.calcInvalidData });
  });

  it('returns error for infinite quantifier', () => {
    expectCalcFull('∀a∈Z a=a', { expectErrorCode: RSErrorCode.iterateInfinity });
  });

  it('setValue, getValue, and resetValue behave as expected', () => {
    calculator.setValue('X42', 123);
    expect(calculator.getValue('X42')).toBe(123);
    calculator.resetValue('X42');
    expect(calculator.getValue('X42')).toBe(null);
  });

  it('setAST registers the AST for future re-evaluation', () => {
    const ast = buildAST('1+2');
    calculator.setAST('myAdd', ast);
    expect(() => calculator.setAST('myAdd', ast)).not.toThrow();
  });

  it('subscribes to and notifies listeners on setValue/resetValue', () => {
    let called = false;
    const unsubscribe = calculator.subscribe('X1', () => (called = true));
    calculator.setValue('X1', [10, 20]);
    expect(called).toBe(true);
    called = false;
    calculator.resetValue('X1');
    expect(called).toBe(true);
    unsubscribe();
    called = false;
    calculator.setValue('X1', [3, 4]);
    expect(called).toBe(false);
  });

  it('listeners removed when no more subscribers', () => {
    let calls = 0;
    const unsubscribe = calculator.subscribe('X1', () => {
      calls++;
    });
    calculator.setValue('X1', [8, 9]);
    expect(calls).toBe(1);
    unsubscribe();
    calculator.setValue('X1', [2, 3]);
    expect(calls).toBe(1); // not incremented
  });

  it('clearAllValues notifies listeners and drops stored values', () => {
    let calls = 0;
    calculator.subscribe('X1', () => {
      calls += 1;
    });
    calculator.clearAllValues();
    expect(calls).toBe(1);
    expect(calculator.getValue('X1')).toBeNull();
    expect(calculator.getValue('C1')).toBeNull();
  });

  // Additional case for real RS logic
  it('evaluates logical expressions', () => {
    expectCalcValue('1=1', '1');
    expectCalcValue('1=0', '0');
  });

  it('returns null instead of a partial set when an imperative exceeds the iteration limit', () => {
    calculator.setValue(
      'X1',
      Array.from({ length: 1001 }, (_, index) => index)
    );
    const ast = buildAST('I{a | a:∈X1; b:∈X1; a=1000}');
    expect(ast.hasError).toBe(false);
    const full = calculator.evaluateFull(ast);
    expect(full.errors.some(error => error.code === RSErrorCode.iterationsLimit)).toBe(true);
    expect(full.value).toBeNull();
    expect(calculator.evaluateFast(ast)).toBeNull();
  });

  it('keeps a genuinely empty imperative result', () => {
    calculator.setValue('X1', [0]);
    const ast = buildAST('I{a | a:∈X1; a=1}');
    expect(ast.hasError).toBe(false);
    expect(calculator.evaluateFast(ast)).toEqual([]);
    expect(calculator.evaluateFull(ast).value).toEqual([]);
    expect(calculator.evaluateFull(ast).errors).toEqual([]);
  });
});
