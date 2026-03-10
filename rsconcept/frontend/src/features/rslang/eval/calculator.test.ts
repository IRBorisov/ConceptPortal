import { beforeEach, describe, expect, it } from 'vitest';

import { type AstNode, buildTree } from '@/utils/parsing';

import { RSErrorCode } from '../error';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';

import { type CalculatorResult, RSCalculator } from './calculator';
import { printValue } from './value-api';

function buildAST(expression: string): AstNode {
  const tree = rslangParser.parse(expression);
  const ast = buildTree(tree.cursor());
  normalizeAST(ast, expression);
  return ast;
}

describe('RSCalculator', () => {
  let calculator: RSCalculator;

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

  function expectCalcFull(expr: string, options?: { expectValue?: string; expectErrorCode?: RSErrorCode; }) {
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

  it('evaluates a simple constant', () => {
    expectCalcValue('1', '1');
  });

  it('evaluates a variable from context', () => {
    expectCalcValue('X1', '{1, 2, 3}');
  });

  it('evaluates a basic set operation', () => {
    expectCalcValue('{2,3,4}∩{2,3,5}', '{2, 3}');
  });

  it('returns error for unknown variable', () => {
    expectCalcFull('X11', { expectErrorCode: RSErrorCode.valueGlobalMissing });
  });

  it('returns error for infinite quantifier', () => {
    expectCalcFull('∀a∈Z a=a', { expectErrorCode: RSErrorCode.valueIterateInfinity });
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
    const unsubscribe = calculator.subscribe('X1', () => { calls++; });
    calculator.setValue('X1', [8, 9]);
    expect(calls).toBe(1);
    unsubscribe();
    calculator.setValue('X1', [2, 3]);
    expect(calls).toBe(1); // not incremented
  });

  // Additional case for real RS logic
  it('evaluates logical expressions', () => {
    expectCalcValue('1=1', '1');
    expectCalcValue('1=0', '0');
  });
});