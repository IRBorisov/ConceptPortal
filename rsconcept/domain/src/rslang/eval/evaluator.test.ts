import { beforeEach, describe, expect, it } from 'vitest';

import { type AstNode, buildTree, visitAstDFS } from '../../parsing';
import { readErrorAnnotation } from '../ast-annotations';
import { RSErrorCode, type RSErrorDescription } from '../error';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';
import { TokenID } from '../parser/token';

import { EvaluationMetadata } from './evaluation-cache';
import { type ASTContext, Evaluator } from './evaluator';
import { BOOL_INFINITY, TUPLE_ID, type ValueContext } from './value';
import { printValue } from './value-api';

// Helper to build AST
function buildAST(expression: string) {
  const tree = rslangParser.parse(expression);
  const ast = buildTree(tree.cursor());
  normalizeAST(ast, expression);
  return ast;
}

function setupValueContext(context: ValueContext): void {
  context.set('X1', [1, 2, 3]);
  context.set('X2', [1, 2, 3]);
  context.set('S1', [1, 2]);
  context.set('S2', [[1, 2, 3], []]);
  context.set('S3', [[TUPLE_ID, 1, 1]]);
  context.set('S4', 1);
}

function setupTreeContext(treeContext: ASTContext): void {
  treeContext.set('F1', buildAST('[a∈ℬ(R1), b∈ℬ(R1×R2)] a∩Pr1(b)'));
}

function findFirstNode(ast: AstNode, typeID: number): AstNode | null {
  let found: AstNode | null = null;
  visitAstDFS(ast, node => {
    if (found === null && node.typeID === typeID) {
      found = node;
    }
  });
  return found;
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
  ['card(∅)', '0'],
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
  ['(1,2)', '(1, 2)'],
  ['{1,2}', '{1, 2}'],
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
  ['red(I{σ | α:∈S2 ; β:∈α ; σ:={β}})', '{1, 2, 3}'],
  ['R{a:=X1 | a\\a}', '{}'],
  ['R{a:=∅ | a∪X1}', '{1, 2, 3}'],
  ['R{a:=X1\\X1 | a∪X1}', '{1, 2, 3}'],
  ['R{(a,b):=(∅,0) | b < 3 | (a∪X1, b+1)}', '({1, 2, 3}, 3)'],
  ['R{ξ:=2 | ξ≥2 | ξ-2}', '0'],
  ['R{ξ:=3 | ξ≥2 | ξ-2}', '1'],
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
  ['Pr1({(1,2),(1,3)})', '{1}'],
  ['Pr2(S3)', '{1}'],
  ['Pr1(S3\\S3)', '{}'],
  ['Pr1,2(S3\\S3)', '{}'],
  ['Fi1[X1](S3)', '{(1, 1)}'],
  ['Fi2,1[X2,X1](S3)', '{(1, 1)}'],
  ['Fi1[(X1\\X1)](S3)', '{}'],
  ['Fi1[X1](S3\\S3)', '{}']
];

const errorData = [
  ['[a∈ℬ(R1)] a=a', { code: RSErrorCode.calculationNotSupported, from: 0, to: 13 }],
  ['debool(X1)', { code: RSErrorCode.calcInvalidDebool, from: 7, to: 9 }],
  ['Pr1(1)', { code: RSErrorCode.calcUnknownError, from: 0, to: 6 }],
  ['∀a∈Z a=a', { code: RSErrorCode.iterateInfinity, from: 3, to: 4 }],
  ['ℬℬ({1,2,3,4,5})', { code: RSErrorCode.booleanBaseLimit, from: 1, to: 15, params: [String(BOOL_INFINITY)] }],
  ['X1\\D1', { code: RSErrorCode.calcGlobalMissing, from: 3, to: 5, params: ['D1'] }],
  ['D1\\X1', { code: RSErrorCode.calcGlobalMissing, from: 0, to: 2, params: ['D1'] }],
  ['¬D1\\X1=X1', { code: RSErrorCode.calcGlobalMissing, from: 1, to: 3, params: ['D1'] }],
  ['card(D1)=1', { code: RSErrorCode.calcGlobalMissing, from: 5, to: 7, params: ['D1'] }],
  ['1=card(D1)', { code: RSErrorCode.calcGlobalMissing, from: 7, to: 9, params: ['D1'] }],
  ['card(D1)+1', { code: RSErrorCode.calcGlobalMissing, from: 5, to: 7, params: ['D1'] }],
  ['1+card(D1)', { code: RSErrorCode.calcGlobalMissing, from: 7, to: 9, params: ['D1'] }],
  ['card(D1)>1', { code: RSErrorCode.calcGlobalMissing, from: 5, to: 7, params: ['D1'] }],
  ['1>card(D1)', { code: RSErrorCode.calcGlobalMissing, from: 7, to: 9, params: ['D1'] }],
  ['card(D1)=1 & 1=1', { code: RSErrorCode.calcGlobalMissing, from: 5, to: 7, params: ['D1'] }],
  ['1=1 & card(D1)=1', { code: RSErrorCode.calcGlobalMissing, from: 11, to: 13, params: ['D1'] }],
  ['∀a∈D1 a=a', { code: RSErrorCode.calcGlobalMissing, from: 3, to: 5, params: ['D1'] }],
  ['∀a∈X1 a∈D1', { code: RSErrorCode.calcGlobalMissing, from: 8, to: 10, params: ['D1'] }],
  ['X1×D1', { code: RSErrorCode.calcGlobalMissing, from: 3, to: 5, params: ['D1'] }],
  ['D1×X1', { code: RSErrorCode.calcGlobalMissing, from: 0, to: 2, params: ['D1'] }],
  ['ℬ(D1)', { code: RSErrorCode.calcGlobalMissing, from: 2, to: 4, params: ['D1'] }],
  ['pr1(D1)', { code: RSErrorCode.calcGlobalMissing, from: 4, to: 6, params: ['D1'] }],
  ['Pr1(D1)', { code: RSErrorCode.calcGlobalMissing, from: 4, to: 6, params: ['D1'] }],
  ['bool(D1)', { code: RSErrorCode.calcGlobalMissing, from: 5, to: 7, params: ['D1'] }],
  ['debool(D1)', { code: RSErrorCode.calcGlobalMissing, from: 7, to: 9, params: ['D1'] }],
  ['red(D1)', { code: RSErrorCode.calcGlobalMissing, from: 4, to: 6, params: ['D1'] }],
  ['{D1}', { code: RSErrorCode.calcGlobalMissing, from: 1, to: 3, params: ['D1'] }],
  ['(D1, X1)', { code: RSErrorCode.calcGlobalMissing, from: 1, to: 3, params: ['D1'] }],
  ['D{t∈D1 | t=t}', { code: RSErrorCode.calcGlobalMissing, from: 4, to: 6, params: ['D1'] }],
  ['D{t∈X1 | t∈D1}', { code: RSErrorCode.calcGlobalMissing, from: 11, to: 13, params: ['D1'] }],
  ['D{a∈D1|a=X1}', { code: RSErrorCode.calcGlobalMissing, from: 4, to: 6, params: ['D1'] }],
  ['D{a∈X1|a=D1}', { code: RSErrorCode.calcGlobalMissing, from: 9, to: 11, params: ['D1'] }],
  ['R{a:=D1 | a∪X1}', { code: RSErrorCode.calcGlobalMissing, from: 5, to: 7, params: ['D1'] }],
  ['R{a:=X1 | a∪D1}', { code: RSErrorCode.calcGlobalMissing, from: 12, to: 14, params: ['D1'] }],
  ['R{a:=X1 | 1=1 | a∪D1}', { code: RSErrorCode.calcGlobalMissing, from: 18, to: 20, params: ['D1'] }],
  ['R{a:=X1 | D1=D1 | a∪X1}', { code: RSErrorCode.calcGlobalMissing, from: 10, to: 12, params: ['D1'] }],
  ['I{(a,b) | a:∈D1; b:=a; b≠a}', { code: RSErrorCode.calcGlobalMissing, from: 13, to: 15, params: ['D1'] }],
  ['I{(a,b) | a:∈X1; b:=a; b≠D1}', { code: RSErrorCode.calcGlobalMissing, from: 25, to: 27, params: ['D1'] }],
  ['I{(a,b) | a:∈X1; b:=D1; b≠a}', { code: RSErrorCode.calcGlobalMissing, from: 20, to: 22, params: ['D1'] }],
  ['∀a∈X1 b=b', { code: RSErrorCode.localUndeclared, from: 6, to: 7, params: ['b'] }],
  ['X1=1', { code: RSErrorCode.calcInvalidData, from: 0, to: 4, params: ['{1, 2, 3}', '1', '='] }],
  ['X1=1 & 1=1', { code: RSErrorCode.calcInvalidData, from: 0, to: 4, params: ['{1, 2, 3}', '1', '='] }]
];

describe('Calculator', () => {
  const context: ValueContext = new Map();
  const treeContext: ASTContext = new Map();
  let calculator: Evaluator;
  let errors: RSErrorDescription[];

  beforeEach(() => {
    calculator = new Evaluator(context, treeContext);
    setupTreeContext(treeContext);
    setupValueContext(context);
    errors = [];
  });

  function expectValue(input: string, expectedValue: string) {
    const ast = buildAST(input);
    expect(ast.hasError).toBe(false);
    const result = calculator.run(ast, error => errors.push(error));
    expect(printValue(result)).toBe(expectedValue);
  }

  function expectError(input: string, expectedError: RSErrorDescription) {
    const ast = buildAST(input);
    expect(ast.hasError).toBe(false);
    expect(errors.length).toBe(0);

    calculator.run(ast, error => errors.push(error));
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatchObject(expectedError);
  }

  // .filter(([input]) => input === 'red(I{σ | α:∈S2 ; β:∈α ; σ:={β}})')
  correctValuesData.forEach(([input, expectedValue]) => {
    it(`Correct value for "${input}"`, () => expectValue(input, expectedValue));
  });

  errorData.forEach(([input, expectedError]) => {
    it(`Error for "${input as string}"`, () => expectError(input as string, expectedError as RSErrorDescription));
  });

  it('Function', () => {
    const funcAst = buildAST('[a∈ℬ(R1), b∈Z] a\\a');
    treeContext.set('F1', funcAst);
    expectValue('F1[F1[X1, 0], 1]', '{}');
  });

  describe('error annotation', () => {
    it('attributes evaluation errors inside a function body to the call site in the main expression', () => {
      const funcAst = buildAST('[a∈X1] ∀b∈Z b=b');
      treeContext.set('F9', funcAst);
      const mainAst = buildAST('F9[X1]');
      const callSite = findFirstNode(mainAst, TokenID.NT_FUNC_CALL);
      expect(callSite).not.toBeNull();

      const funcExpr = '[a∈X1] ∀b∈Z b=b';
      const zOffset = funcExpr.indexOf('Z');
      let innerErrorNode: AstNode | null = null;
      visitAstDFS(funcAst, node => {
        if (
          innerErrorNode === null &&
          node.typeID === TokenID.LIT_WHOLE_NUMBERS &&
          node.from === zOffset &&
          node.to === zOffset + 1
        ) {
          innerErrorNode = node;
        }
      });
      expect(innerErrorNode).not.toBeNull();

      calculator.run(mainAst, error => errors.push(error), true);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        code: RSErrorCode.iterateInfinity,
        from: callSite!.from,
        to: callSite!.to,
        stack: [{ alias: 'F9', from: zOffset, to: zOffset + 1 }]
      });
      expect(errors[0]?.stack).toHaveLength(1);
      expect(readErrorAnnotation(callSite!)).toMatchObject({ code: RSErrorCode.iterateInfinity });
      expect(readErrorAnnotation(innerErrorNode!)).toBeNull();
    });

    it('keeps nested call surface span in the root expression and records the full stack', () => {
      const innerExpr = '[a∈X1] debool(∅)';
      const midExpr = '[a∈X1] F8[a]';
      treeContext.set('F8', buildAST(innerExpr));
      treeContext.set('F7', buildAST(midExpr));
      const mainAst = buildAST('F7[X1]');
      const outerCall = findFirstNode(mainAst, TokenID.NT_FUNC_CALL);
      expect(outerCall).not.toBeNull();

      const midAst = treeContext.get('F7')!;
      const midCall = findFirstNode(midAst, TokenID.NT_FUNC_CALL);
      expect(midCall).not.toBeNull();

      const deboolArgFrom = innerExpr.indexOf('∅');
      calculator.run(mainAst, error => errors.push(error), true);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        code: RSErrorCode.calcInvalidDebool,
        from: outerCall!.from,
        to: outerCall!.to,
        stack: [
          { alias: 'F8', from: deboolArgFrom, to: deboolArgFrom + 1 },
          { alias: 'F7', from: midCall!.from, to: midCall!.to }
        ]
      });
      expect(errors[0]?.stack).toHaveLength(2);
      expect(readErrorAnnotation(outerCall!)).toMatchObject({ code: RSErrorCode.calcInvalidDebool });
    });

    it('distinguishes which call site failed when the same function is used twice', () => {
      treeContext.set('F8', buildAST('[a∈ℬ(X1)] debool(a)'));
      const mainAst = buildAST('F8[{1}] ∪ F8[X1]');
      const callSites: AstNode[] = [];
      visitAstDFS(mainAst, node => {
        if (node.typeID === TokenID.NT_FUNC_CALL) {
          callSites.push(node);
        }
      });
      expect(callSites).toHaveLength(2);

      calculator.run(mainAst, error => errors.push(error));

      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        code: RSErrorCode.calcInvalidDebool,
        from: callSites[1].from,
        to: callSites[1].to,
        stack: [{ alias: 'F8' }]
      });
      expect(errors[0]?.stack).toHaveLength(1);
    });
  });

  describe('repeated relation filters', () => {
    const expression = 'I{(a,F9[a]) | a:∈X9}';

    beforeEach(() => {
      treeContext.set('F9', buildAST('[a∈Z] Fi1[{a}](S9)'));
      context.set('X9', [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('preserves filtered row order and observes changes between evaluations', () => {
      const rows = Array.from({ length: 64 }, (_, i) => [TUPLE_ID, (i % 8) + 1, 63 - i]);
      rows.push([...rows[0]]);
      context.set('S9', rows);
      const ast = buildAST(expression);
      const expected = calculator.run(ast, undefined, false, true);

      expect(expected).not.toBeNull();
      expect(calculator.run(ast)).toEqual(expected);

      rows[0][1] = 9;
      const updated = calculator.run(ast);
      expect(updated).not.toEqual(expected);
      expect(updated).toEqual(calculator.run(ast, undefined, false, true));
    });

    it('keeps ordinary membership semantics when the relation column contains NaN', () => {
      const rows = Array.from({ length: 64 }, (_, i) => [TUPLE_ID, (i % 8) + 1, i]);
      rows[63][1] = NaN;
      context.set('S9', rows);
      const ast = buildAST(expression);
      const expected = calculator.run(ast, undefined, false, true);

      expect(expected).not.toBeNull();
      expect(calculator.run(ast)).toEqual(expected);
    });

    it('keeps filtering when a high-cardinality column exceeds the key budget', () => {
      const rows = Array.from({ length: 4_097 }, (_, i) => [TUPLE_ID, i + 1, i]);
      context.set('S9', rows);
      context.set('X9', [1, 2, 3, 4_096, 4_097, 4_098]);
      const ast = buildAST(expression);
      const expected = calculator.run(ast, undefined, false, true);

      expect(expected).not.toBeNull();
      expect(calculator.run(ast)).toEqual(expected);
    });
  });

  describe('evaluation cache', () => {
    beforeEach(() => {
      treeContext.set('F9', buildAST('[a∈ℬ(X1)] a'));
    });

    function runWithHits(input: string, disableCache: boolean = false): { value: string; hits: number } {
      const ast = buildAST(input);
      expect(ast.hasError).toBe(false);
      errors = [];
      const result = calculator.run(ast, error => errors.push(error), false, disableCache);
      expect(errors.length).toBe(0);
      return { value: printValue(result), hits: calculator.cacheHits };
    }

    it('reuses cached subexpression while loop variables are unchanged', () => {
      const { hits } = runWithHits('I{a | a:∈S1; u:=F9[a]; v:=F9[a]}');
      expect(hits).toBe(2);
    });

    it('recomputes when a dependency changes across iterations', () => {
      const { value, hits } = runWithHits('I{a | a:∈X1; t:=F9[a]}');
      expect(value).toBe('{1, 2, 3}');
      expect(hits).toBe(0);
    });

    it('shares cache between structurally identical call sites', () => {
      const metadata = new EvaluationMetadata();
      const callA = buildAST('F9[X1]');
      const callB = buildAST('F9[X1]');
      expect(metadata.get(callA).structuralKey).toBe(metadata.get(callB).structuralKey);
    });

    it('disables cache when disableCache is true', () => {
      const { value, hits } = runWithHits('I{a | a:∈X1; t:=F9[a]}', true);
      expect(value).toBe('{1, 2, 3}');
      expect(hits).toBe(0);
    });
  });
});
