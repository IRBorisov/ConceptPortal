import { beforeEach, describe, expect, it } from 'vitest';

import { buildTree } from '@/utils/parsing';

import { RSErrorCode, type RSErrorDescription } from '../error';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';

import { RSCalculator } from './calculator';
import { BOOL_INFINITY, TUPLE_ID } from './value';
import { printValue } from './value-api';


// Helper to build AST
function buildAST(expression: string) {
  const tree = rslangParser.parse(expression);
  const ast = buildTree(tree.cursor());
  normalizeAST(ast, expression);
  return ast;
}

function setupValueContext(calculator: RSCalculator): void {
  calculator.setValue('X1', [1, 2, 3]);
  calculator.setValue('X2', [1, 2, 3]);
  calculator.setValue('S1', [1, 2]);
  calculator.setValue('S2', [[1, 2, 3], []]);
  calculator.setValue('S3', [[TUPLE_ID, 1, 1]]);
  calculator.setValue('S4', 1);
}

function setupTreeContext(calculator: RSCalculator): void {
  calculator.setAST('F1', buildAST('[a∈ℬ(R1), b∈ℬ(R1×R2)] a∩Pr1(b)'));
}

const correctValuesData = [
  // Literals and global identifiers
  ['1', '1'],
  ['X1', '{1, 2, 3}'],
  ['∅', '{}'],

  // Functions

  // Integral
  ['1+2', '3'],
  ['2*2', '4'],
  ['4-11', '-7'],
  ['card(X1)', '3'],
  // Logical predicates
  ['2+2=4', '1'],
  ['1=1', '1'],
  ['1≠1', '0'],
  ['1<1', '0'],
  ['1≤1', '1'],
  ['1>1', '0'],
  ['1≥1', '1'],
  ['1<2', '1'],
  ['2>1', '1'],
  ['¬1=2', '1'],
  // Logical operations
  ['¬1=1', '0'],
  ['1=1 & 1=1', '1'],
  ['1=2 & 1=1', '0'],
  ['1=1 & 1=2', '0'],
  ['1=2 & 1=2', '0'],
  ['1=1 ∨ 1=1', '1'],
  ['1=2 ∨ 1=1', '1'],
  ['1=1 ∨ 1=2', '1'],
  ['1=2 ∨ 1=2', '0'],
  ['1=1 ⇒ 1=1', '1'],
  ['1=2 ⇒ 1=1', '1'],
  ['1=1 ⇒ 1=2', '0'],
  ['1=2 ⇒ 1=2', '1'],
  ['1=1 ⇔ 1=1', '1'],
  ['1=2 ⇔ 1=1', '0'],
  ['1=1 ⇔ 1=2', '0'],
  ['1=2 ⇔ 1=2', '1'],
  // Quantifiers
  ['∀a∈X1 a=a', '1'],
  ['∀a,b∈X1 a=b', '0'],
  ['∃a,b∈X1 a=b', '1'],
  ['∃(a,b)∈S3 (a∈X1 & b∈X2)', '1'],
  ['∀a∈X1 a≠a', '0'],
  ['∀a∈(X1\\X1) a=a', '1'],
  ['∀a∈(X1\\X1) a≠a', '1'],
  ['∀a∈X1 a∈S1', '0'],
  ['∃a∈X1 a=a', '1'],
  ['∃a∈X1 a≠a', '0'],
  ['∃a∈(X1\\X1) a=a', '0'],
  ['∃a∈(X1\\X1) a≠a', '0'],
  ['∃a∈X1 a∈S1', '1'],
  ['debool({X1})=X1', '1'],
  ['∀a∈X1 debool({a})=a', '1'],
  ['∀a∈X1×X1 debool({a})=a', '1'],
  // Set predicates
  ['X1=X1', '1'],
  ['X1≠X1', '0'],
  ['X1=∅', '0'],
  ['S4∈X1', '1'],
  ['X1≠X1', '0'],
  ['X1≠S1', '1'],
  ['S1≠X1', '1'],
  ['X1∈S2', '1'],
  ['S1∈S2', '0'],
  ['X1∉S2', '0'],
  ['S1∉S2', '1'],
  ['X1⊂X1', '0'],
  ['S1⊂X1', '1'],
  ['X1⊂S1', '0'],
  ['X1⊄X1', '1'],
  ['S1⊄X1', '0'],
  ['X1⊄S1', '1'],
  ['X1⊆X1', '1'],
  ['S1⊆X1', '1'],
  ['X1⊆S1', '0'],
  // Constructors
  ['X1×∅', '{}'],
  ['X1×(X2\\X2)', '{}'],
  ['(X1\\X1)×X2', '{}'],
  ['X1×X2', '{(1, 1), (1, 2), (1, 3), (2, 1), (2, 2), (2, 3), (3, 1), (3, 2), (3, 3)}'],
  ['ℬ(∅)', '{{}}'],
  ['ℬ(X1)', '{{}, {1}, {2}, {3}, {1, 2}, {1, 3}, {2, 3}, {1, 2, 3}}'],
  ['ℬ(X1\\X1)', '{{}}'],
  ['(1,2)', '(1, 2)'],
  ['(X1,2)', '({1, 2, 3}, 2)'],
  ['{X1}', '{{1, 2, 3}}'],
  ['{X1, X1}', '{{1, 2, 3}}'],
  ['{X1, S1}', '{{1, 2}, {1, 2, 3}}'],
  ['{X1, S1, X1}', '{{1, 2}, {1, 2, 3}}'],
  ['(X1, X1)', '({1, 2, 3}, {1, 2, 3})'],
  ['(X1, X2, X1)', '({1, 2, 3}, {1, 2, 3}, {1, 2, 3})'],
  ['D{a∈X1|1=1}', '{1, 2, 3}'],
  ['D{a∈X1|a≠a}', '{}'],
  ['D{(a,b)∈S3|a∈X1}', '{(1, 1)}'],
  ['I{(a, b) | a:∈X1; b:=a; b≠a}', '{}'],
  ['I{a | a:∈X1}', '{1, 2, 3}'],
  ['I{a | (a, b):∈X1×X1; b=b}', '{1, 2, 3}'],
  ['R{a:=X1 | a\\a}', '{}'],
  ['R{a:=∅ | a∪X1}', '{1, 2, 3}'],
  ['R{a:=X1\\X1 | a∪X1}', '{1, 2, 3}'],
  ['R{(a,b):=(∅,0) | b < 3 | (a∪X1, b+1)}', '({1, 2, 3}, 3)'],
  // Set operations
  ['X1∪X1', '{1, 2, 3}'],
  ['X1∪∅', '{1, 2, 3}'],
  ['X1∪S1', '{1, 2, 3}'],
  ['S1∪X1', '{1, 2, 3}'],
  ['X1∩X1', '{1, 2, 3}'],
  ['X1∩∅', '{}'],
  ['X1∩S1', '{1, 2}'],
  ['S1∩X1', '{1, 2}'],
  ['X1\\X1', '{}'],
  ['X1\\S1', '{3}'],
  ['S1\\X1', '{}'],
  ['X1∆X1', '{}'],
  ['X1∆S1', '{3}'],
  ['S1∆X1', '{3}'],
  ['bool(X1)', '{{1, 2, 3}}'],
  ['bool(X1\\X1)', '{{}}'],
  ['debool(bool(X1))', '{1, 2, 3}'],
  ['red(S2)', '{1, 2, 3}'],
  ['red(S2\\S2)', '{}'],
  ['pr1((1, 2))', '1'],
  ['pr2((1, 2))', '2'],
  ['pr2,1((1, 2))', '(2, 1)'],
  ['Pr1(S3)', '{1}'],
  ['Pr2(S3)', '{1}'],
  ['Pr1(S3\\S3)', '{}'],
  ['Pr1,2(S3\\S3)', '{}'],
  ['Fi1[X1](S3)', '{(1, 1)}'],
  ['Fi2,1[X2,X1](S3)', '{(1, 1)}'],
  ['Fi1[(X1\\X1)](S3)', '{}'],
  ['Fi1[X1](S3\\S3)', '{}'],
];

const errorData = [
  ['debool(X1)', { code: RSErrorCode.valueInvalidDebool, position: 0 }],
  ['∀a∈Z a=a', { code: RSErrorCode.valueIterateInfinity, position: 3 }],
  ['ℬℬℬ(X1)', { code: RSErrorCode.valueBooleanLimit, position: 0, params: [String(BOOL_INFINITY)] }],
  ['X1\\D1', { code: RSErrorCode.valueGlobalMissing, position: 3, params: ['D1'] }],
  ['D1\\X1', { code: RSErrorCode.valueGlobalMissing, position: 0, params: ['D1'] }],
  ['¬D1\\X1=X1', { code: RSErrorCode.valueGlobalMissing, position: 1, params: ['D1'] }],
  ['card(D1)=1', { code: RSErrorCode.valueGlobalMissing, position: 5, params: ['D1'] }],
  ['1=card(D1)', { code: RSErrorCode.valueGlobalMissing, position: 7, params: ['D1'] }],
  ['card(D1)+1', { code: RSErrorCode.valueGlobalMissing, position: 5, params: ['D1'] }],
  ['1+card(D1)', { code: RSErrorCode.valueGlobalMissing, position: 7, params: ['D1'] }],
  ['card(D1)>1', { code: RSErrorCode.valueGlobalMissing, position: 5, params: ['D1'] }],
  ['1>card(D1)', { code: RSErrorCode.valueGlobalMissing, position: 7, params: ['D1'] }],
  ['card(D1)=1 & 1=1', { code: RSErrorCode.valueGlobalMissing, position: 5, params: ['D1'] }],
  ['1=1 & card(D1)=1', { code: RSErrorCode.valueGlobalMissing, position: 11, params: ['D1'] }],
  ['∀a∈D1 a=a', { code: RSErrorCode.valueGlobalMissing, position: 3, params: ['D1'] }],
  ['∀a∈X1 a∈D1', { code: RSErrorCode.valueGlobalMissing, position: 8, params: ['D1'] }],
  ['X1×D1', { code: RSErrorCode.valueGlobalMissing, position: 3, params: ['D1'] }],
  ['D1×X1', { code: RSErrorCode.valueGlobalMissing, position: 0, params: ['D1'] }],
  ['ℬ(D1)', { code: RSErrorCode.valueGlobalMissing, position: 2, params: ['D1'] }],
  ['pr1(D1)', { code: RSErrorCode.valueGlobalMissing, position: 4, params: ['D1'] }],
  ['Pr1(D1)', { code: RSErrorCode.valueGlobalMissing, position: 4, params: ['D1'] }],
  ['bool(D1)', { code: RSErrorCode.valueGlobalMissing, position: 5, params: ['D1'] }],
  ['debool(D1)', { code: RSErrorCode.valueGlobalMissing, position: 7, params: ['D1'] }],
  ['red(D1)', { code: RSErrorCode.valueGlobalMissing, position: 4, params: ['D1'] }],
  ['{D1}', { code: RSErrorCode.valueGlobalMissing, position: 1, params: ['D1'] }],
  ['(D1, X1)', { code: RSErrorCode.valueGlobalMissing, position: 1, params: ['D1'] }],
  ['D{t∈D1 | t=t}', { code: RSErrorCode.valueGlobalMissing, position: 4, params: ['D1'] }],
  ['D{t∈X1 | t∈D1}', { code: RSErrorCode.valueGlobalMissing, position: 11, params: ['D1'] }],
  ['D{a∈D1|a=X1}', { code: RSErrorCode.valueGlobalMissing, position: 4, params: ['D1'] }],
  ['D{a∈X1|a=D1}', { code: RSErrorCode.valueGlobalMissing, position: 9, params: ['D1'] }],
  ['R{a:=D1 | a∪X1}', { code: RSErrorCode.valueGlobalMissing, position: 5, params: ['D1'] }],
  ['R{a:=X1 | a∪D1}', { code: RSErrorCode.valueGlobalMissing, position: 12, params: ['D1'] }],
  ['R{a:=X1 | 1=1 | a∪D1}', { code: RSErrorCode.valueGlobalMissing, position: 18, params: ['D1'] }],
  ['R{a:=X1 | D1=D1 | a∪X1}', { code: RSErrorCode.valueGlobalMissing, position: 10, params: ['D1'] }],
  ['I{(a,b) | a:∈D1; b:=a; b≠a}', { code: RSErrorCode.valueGlobalMissing, position: 13, params: ['D1'] }],
  ['I{(a,b) | a:∈X1; b:=a; b≠D1}', { code: RSErrorCode.valueGlobalMissing, position: 25, params: ['D1'] }],
  ['I{(a,b) | a:∈X1; b:=D1; b≠a}', { code: RSErrorCode.valueGlobalMissing, position: 20, params: ['D1'] }],
];

describe('Calculator', () => {
  let calculator: RSCalculator;
  let errors: RSErrorDescription[];

  beforeEach(() => {
    calculator = new RSCalculator();
    setupTreeContext(calculator);
    setupValueContext(calculator);
    errors = [];
  });

  function expectValue(input: string, expectedValue: string) {
    const ast = buildAST(input);
    expect(ast.hasError).toBe(false);
    const result = calculator.evaluate(ast, error => (errors.push(error)));
    expect(result.success).toBe(true);
    expect(printValue(result.value)).toBe(expectedValue);
  }

  function expectError(input: string, expectedError: RSErrorDescription) {
    const ast = buildAST(input);
    expect(ast.hasError).toBe(false);
    expect(errors.length).toBe(0);

    calculator.evaluate(ast, error => (errors.push(error)));
    expect(errors.length).toBe(1);
    expect(errors[0]).toEqual(expectedError);
  }

  // .filter(([input]) => input === 'R{(a,b):=(∅,0) | b < 3 | (a∪X1, b+1)}')
  correctValuesData.forEach(([input, expectedValue]) => {
    it(`Correct value for "${input}"`, () => expectValue(input, expectedValue));
  });

  errorData.forEach(([input, expectedError]) => {
    it(`Error for "${input as string}"`, () => expectError(input as string, expectedError as RSErrorDescription));
  });

  it('Function', () => {
    const funcAst = buildAST('[a∈ℬ(R1), b∈Z] a\\a');
    calculator.setAST('F1', funcAst);
    expectValue('F1[F1[X1, 0], 1]', '{}');
  });
});
