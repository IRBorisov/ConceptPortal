import { beforeEach, describe, expect, it } from 'vitest';

import { buildTree } from '@/utils/parsing';

import { RSErrorCode, type RSErrorDescription } from '../error';
import { labelType } from '../labels';
import { normalizeAST } from '../parser/normalize';
import { parser as rslangParser } from '../parser/parser';

import { TypeAuditor } from './type-auditor';
import { basic, bool, constant, LogicT, tuple, type TypeContext, TypeID } from './typification';

// Helper to build AST
function buildAST(expression: string) {
  const tree = rslangParser.parse(expression);
  const ast = buildTree(tree.cursor());
  normalizeAST(ast, expression);
  return ast;
}

// Helper: Set up type context
function setupTypeContext(): TypeContext {
  const context: TypeContext = new Map();
  context.set('X1', bool({ typeID: TypeID.basic, baseID: 'X1' }));
  context.set('S1', bool(tuple([basic('X1'), basic('X1')])));
  context.set('S2', bool(bool(basic('X1'))));
  context.set('F1', {
    typeID: TypeID.function,
    result: bool(basic('X1')),
    args: [
      { alias: 'a', type: bool(basic('X1')) },
      { alias: 'b', type: bool(basic('X1')) }
    ]
  });
  context.set('P1', {
    typeID: TypeID.predicate,
    result: LogicT,
    args: [
      { alias: 'a', type: bool(basic('X1')) },
      { alias: 'b', type: bool(basic('X1')) }
    ]
  });
  context.set('C1', bool(constant('C1')));
  context.set('C2', bool(constant('C2')));
  context.set('S3', constant('C1'));
  context.set('S4', constant('C2'));
  return context;
}

const correctTypesData = [
  // Literals and global identifiers
  ['1', 'Z'],
  ['Z', 'ℬ(Z)'],
  ['∅', 'ℬ(R0)'],
  ['S1', 'ℬ(X1×X1)'],
  // Functions
  ['[a∈ℬ(R1)] a=a', '[ℬ(R1)] → Logic'],
  ['[a∈X1] X1\\{a}', '[X1] → ℬ(X1)'],
  ['[a∈D{b∈X1 | b=b}] a=a', '[X1] → Logic'],
  ['P1[X1, X1]', 'Logic'],
  ['F1[X1, X1]', 'ℬ(X1)'],
  ['[β∈ℬ(R1×R2)] Pr1(β)', '[ℬ(R1×R2)] → ℬ(R1)'],
  ['[α∈ℬ(R1), β∈ℬ(R1×R2)] α⊆Pr1(β) & card(α)=card(β)', '[ℬ(R1), ℬ(R1×R2)] → Logic'],
  ['[α∈Z, μ∈Z] R{ξ:=α | ξ<0 ∨ ξ≥μ | debool(I{ξ-μ | ξ≥μ} ∪ I{ξ+μ | ξ<0})}', '[Z, Z] → Z'],
  ['[σ∈ℬ(Z×Z), π∈Z] I{(α, μ+π) | (α,μ):∈σ}', '[ℬ(Z×Z), Z] → ℬ(Z×Z)'],
  // Integral
  ['card(X1)', 'Z'],
  ['card(C1)', 'Z'],
  ['1+1', 'Z'],
  ['1-2', 'Z'],
  ['1*2', 'Z'],
  ['S3+1', 'C1'],
  ['1+S3', 'C1'],
  ['S3+S3', 'C1'],
  ['S3-S4', 'Z'],
  // Logical
  ['1 > 1', 'Logic'],
  ['1 ≥ 1', 'Logic'],
  ['1 < 1', 'Logic'],
  ['1 ≤ 1', 'Logic'],
  ['1 = 1', 'Logic'],
  ['1 ≠ 1', 'Logic'],
  ['1 > S3', 'Logic'],
  ['S4 = S4', 'Logic'],
  ['1=2 & 3=4', 'Logic'],
  ['X1=X1', 'Logic'],
  ['X1=∅', 'Logic'],
  ['∅=X1', 'Logic'],
  ['{S3}=C1', 'Logic'],
  ['∀a∈X1 1=1', 'Logic'],
  ['∃a∈X1 1=1', 'Logic'],
  ['∃a,b∈X1 a=b', 'Logic'],
  ['∃(a,b)∈X1×X1 a=b', 'Logic'],
  ['∀a∈X1 R{b := a | b}=a', 'Logic'],
  ['∀a∈S1 R{(a1,a2) := a | (a1,a2)}=a', 'Logic'],
  ['¬∃a∈ℬ(S1)\\{∅} P1[Pr1(a),Pr2(a)]', 'Logic'],
  // Set predicates
  ['X1=X1', 'Logic'],
  ['X1=∅', 'Logic'],
  ['Z=∅', 'Logic'],
  ['1 ∈ Z', 'Logic'],
  ['S3 ∈ C1', 'Logic'],
  ['S3 ∈ Z', 'Logic'],
  ['X1 ∈ S2', 'Logic'],
  ['X1 ⊂ X1', 'Logic'],
  ['X1 ∉ S2', 'Logic'],
  ['X1 ⊆ X1', 'Logic'],
  ['X1 ⊄ X1', 'Logic'],
  // Constructors
  ['ℬ(X1)', 'ℬℬ(X1)'],
  ['X1×X1', 'ℬ(X1×X1)'],
  ['{X1, X1}', 'ℬℬ(X1)'],
  ['{1}', 'ℬ(Z)'],
  ['{1, card(X1)}', 'ℬ(Z)'],
  ['{S3, 1}', 'ℬ(C1)'],
  ['{1, S3}', 'ℬ(C1)'],
  ['(X1, X1)', 'ℬ(X1)×ℬ(X1)'],
  ['(1, 2)', 'Z×Z'],
  ['{(1, S3), (S3, 1)}', 'ℬ(C1×C1)'],
  ['D{t ∈ ℬ(X1) | t=t}', 'ℬℬ(X1)'],
  ['D{t ∈ Z | t>2}', 'ℬ(Z)'],
  ['D{t ∈ S1 | pr2(t)=pr1(t)}', 'ℬ(X1×X1)'],
  ['R{a := S1 | card(a)<10 | a ∪ a}', 'ℬ(X1×X1)'],
  ['R{a := S1 | a ∪ a}', 'ℬ(X1×X1)'],
  ['R{a := 1 | a<10 | a+1}', 'Z'],
  ['R{a := 1 | a<S3 | a+S3}', 'C1'],
  ['I{(a, b) | a :∈ X1; b := a}', 'ℬ(X1×X1)'],
  ['I{(a, b) | a :∈ X1; b := a; 1=1}', 'ℬ(X1×X1)'],
  // Set operations
  ['X1 ∪ X1', 'ℬ(X1)'],
  ['X1 \\ X1', 'ℬ(X1)'],
  ['X1 ∩ X1', 'ℬ(X1)'],
  ['X1 ∆ X1', 'ℬ(X1)'],
  ['C1 ∪ C1', 'ℬ(C1)'],
  ['{1} ∪ C1', 'ℬ(C1)'],
  ['C1 ∪ {1}', 'ℬ(C1)'],
  ['{(S3, 1)} ∪ {(1, S3)}', 'ℬ(C1×C1)'],
  ['Pr1(S1)', 'ℬ(X1)'],
  ['pr2((S1,1))', 'Z'],
  ['Fi1[X1](S1)', 'ℬ(X1×X1)'],
  ['Fi1[{1,2,3}](Z×X1)', 'ℬ(Z×X1)'],
  ['Fi1[{1,2,3}](C1×X1)', 'ℬ(C1×X1)'],
  ['Fi2,1[S1](S1)', 'ℬ(X1×X1)'],
  ['Pr2,1(S1)', 'ℬ(X1×X1)'],
  ['Pr2,1(C1×X1)', 'ℬ(X1×C1)'],
  ['bool(X1)', 'ℬℬ(X1)'],
  ['debool({X1})', 'ℬ(X1)'],
  ['red(S2)', 'ℬ(X1)'],
  // Recursion with empty set
  ['R{a:=∅ | a∪X1}', 'ℬ(X1)']
];

const errorData = [
  // Identifiers
  ['X42', { code: RSErrorCode.globalNotTyped, from: 0, to: 3, params: ['X42'] }],
  ['F42[X1]', { code: RSErrorCode.globalNotTyped, from: 0, to: 3, params: ['F42'] }],
  // Radicals
  ['R1', { code: RSErrorCode.radicalUsage, from: 0, to: 2, params: ['R1'] }],
  ['[a∈ℬ(R1)] R1\\a', { code: RSErrorCode.radicalUsage, from: 10, to: 12, params: ['R1'] }],
  // Functions
  ['F1[X1]', { code: RSErrorCode.invalidArgsArity, from: 3, to: 5, params: ['2', '1'] }],
  ['F1[X1, X1, X1]', { code: RSErrorCode.invalidArgsArity, from: 3, to: 5, params: ['2', '3'] }],
  ['F1[X1, S1]', { code: RSErrorCode.invalidArgumentType, from: 7, to: 9, params: ['b∈ℬ(X1)', 'ℬ(X1×X1)'] }],
  ['F1[S1, X1]', { code: RSErrorCode.invalidArgumentType, from: 3, to: 5, params: ['a∈ℬ(X1)', 'ℬ(X1×X1)'] }],
  ['P1[X1]', { code: RSErrorCode.invalidArgsArity, from: 3, to: 5, params: ['2', '1'] }],
  ['P1[X1, X1, X1]', { code: RSErrorCode.invalidArgsArity, from: 3, to: 5, params: ['2', '3'] }],
  ['P1[X1, S1]', { code: RSErrorCode.invalidArgumentType, from: 7, to: 9, params: ['b∈ℬ(X1)', 'ℬ(X1×X1)'] }],
  ['P1[S1, X1]', { code: RSErrorCode.invalidArgumentType, from: 3, to: 5, params: ['a∈ℬ(X1)', 'ℬ(X1×X1)'] }],
  // Integral
  ['card(debool(X1))', { code: RSErrorCode.invalidCard, from: 5, to: 15, params: ['X1'] }],
  ['card(S3)', { code: RSErrorCode.invalidCard, from: 5, to: 7, params: ['C1'] }],
  ['card(1)', { code: RSErrorCode.invalidCard, from: 5, to: 6, params: ['Z'] }],
  ['card((1,2))', { code: RSErrorCode.invalidCard, from: 5, to: 10, params: ['Z×Z'] }],
  ['debool(X1)+1', { code: RSErrorCode.arithmeticNotSupported, from: 0, to: 10, params: ['X1'] }],
  ['1+debool(X1)', { code: RSErrorCode.arithmeticNotSupported, from: 2, to: 12, params: ['X1'] }],
  // Logical
  ['debool(X1)<1', { code: RSErrorCode.orderingNotSupported, from: 0, to: 10, params: ['X1'] }],
  ['1<debool(X1)', { code: RSErrorCode.orderingNotSupported, from: 2, to: 12, params: ['X1'] }],
  ['debool(X1)=1', { code: RSErrorCode.typesNotCompatible, from: 0, to: 12, params: ['X1', 'Z'] }],
  ['1=debool(X1)', { code: RSErrorCode.typesNotCompatible, from: 0, to: 12, params: ['Z', 'X1'] }],
  ['S1=S2', { code: RSErrorCode.typesNotCompatible, from: 0, to: 5, params: ['ℬ(X1×X1)', 'ℬℬ(X1)'] }],
  ['∀a,a∈X1 a=a', { code: RSErrorCode.localShadowing, from: 3, to: 4, params: ['a'] }],
  ['∀(a,a)∈S1 a=a', { code: RSErrorCode.localShadowing, from: 4, to: 5, params: ['a'] }],
  ['∀(a,b)∈X1 a=b', { code: RSErrorCode.invalidCortegeDeclare, from: 2, to: 3 }],
  ['∀a∈X1 D{a∈S1| 1=1}=S1', { code: RSErrorCode.localShadowing, from: 8, to: 9, params: ['a'] }],
  ['∀a∈X1 a=a & a=a', { code: RSErrorCode.localOutOfScope, from: 12, to: 13, params: ['a'] }],
  ['∀a∈X1 a=a & debool(X1)=a', { code: RSErrorCode.localOutOfScope, from: 23, to: 24, params: ['a'] }],
  // Set predicates
  ['X1∈X1', { code: RSErrorCode.invalidElementPredicate, from: 0, to: 5, params: ['ℬ(X1)', '∈', 'ℬ(X1)'] }],
  ['(1,2)∈X1', { code: RSErrorCode.invalidElementPredicate, from: 0, to: 8, params: ['Z×Z', '∈', 'ℬ(X1)'] }],
  ['(1,2)∈Z', { code: RSErrorCode.invalidElementPredicate, from: 0, to: 7, params: ['Z×Z', '∈', 'ℬ(Z)'] }],
  ['{1}∈Z', { code: RSErrorCode.invalidElementPredicate, from: 0, to: 5, params: ['ℬ(Z)', '∈', 'ℬ(Z)'] }],
  ['{1}∉Z', { code: RSErrorCode.invalidElementPredicate, from: 0, to: 5, params: ['ℬ(Z)', '∉', 'ℬ(Z)'] }],
  ['X1⊆S2', { code: RSErrorCode.typesNotEqual, from: 0, to: 5, params: ['ℬ(X1)', 'ℬℬ(X1)'] }],
  ['X1⊄S2', { code: RSErrorCode.typesNotEqual, from: 0, to: 5, params: ['ℬ(X1)', 'ℬℬ(X1)'] }],
  ['X1⊂S2', { code: RSErrorCode.typesNotEqual, from: 0, to: 5, params: ['ℬ(X1)', 'ℬℬ(X1)'] }],
  // Constructors
  ['ℬ(S3)', { code: RSErrorCode.invalidBoolean, from: 2, to: 4, params: ['C1'] }],
  ['ℬ((1,2))', { code: RSErrorCode.invalidBoolean, from: 2, to: 7, params: ['Z×Z'] }],
  ['S3×Z', { code: RSErrorCode.invalidDecart, from: 0, to: 2, params: ['C1'] }],
  ['{X1, S1}', { code: RSErrorCode.invalidEnumeration, from: 5, to: 7, params: ['ℬ(X1)', 'ℬ(X1×X1)'] }],
  ['{S1, X1}', { code: RSErrorCode.invalidEnumeration, from: 5, to: 7, params: ['ℬ(X1×X1)', 'ℬ(X1)'] }],
  ['{1, X1}', { code: RSErrorCode.invalidEnumeration, from: 4, to: 6, params: ['Z', 'ℬ(X1)'] }],
  ['{X1, 1}', { code: RSErrorCode.invalidEnumeration, from: 5, to: 6, params: ['ℬ(X1)', 'Z'] }],
  ['{(1,2), (X1,X1)}', { code: RSErrorCode.invalidEnumeration, from: 8, to: 15, params: ['Z×Z', 'ℬ(X1)×ℬ(X1)'] }],
  ['R{a := S1 | {a}}', { code: RSErrorCode.typesNotEqual, from: 12, to: 15, params: ['ℬℬ(X1×X1)', 'ℬ(X1×X1)'] }],
  [
    'I{(a, b) | a:∈X1; b:={a}; a≠b}',
    { code: RSErrorCode.typesNotCompatible, from: 26, to: 29, params: ['X1', 'ℬ(X1)'] }
  ],
  // Set operations
  ['X1 ∪ ∅', { code: RSErrorCode.invalidEmptySetUsage, from: 5, to: 6 }],
  ['X1 ∪ S1', { code: RSErrorCode.typesNotEqual, from: 0, to: 7, params: ['ℬ(X1)', 'ℬ(X1×X1)'] }],
  ['S1 ∪ X1', { code: RSErrorCode.typesNotEqual, from: 0, to: 7, params: ['ℬ(X1×X1)', 'ℬ(X1)'] }],
  ['Pr1(X1)', { code: RSErrorCode.invalidProjectionSet, from: 4, to: 6, params: ['Pr1', 'ℬ(X1)'] }],
  ['Pr3(S1)', { code: RSErrorCode.invalidProjectionSet, from: 4, to: 6, params: ['Pr3', 'ℬ(X1×X1)'] }],
  ['Pr1,3(S1)', { code: RSErrorCode.invalidProjectionSet, from: 6, to: 8, params: ['Pr1,3', 'ℬ(X1×X1)'] }],
  ['Pr1((1,2))', { code: RSErrorCode.invalidProjectionSet, from: 4, to: 9, params: ['Z×Z'] }],
  ['pr1(X1)', { code: RSErrorCode.invalidProjectionTuple, from: 4, to: 6, params: ['pr1', 'ℬ(X1)'] }],
  ['pr1(debool(X1))', { code: RSErrorCode.invalidProjectionTuple, from: 4, to: 14, params: ['pr1', 'X1'] }],
  ['pr3(debool(S1))', { code: RSErrorCode.invalidProjectionTuple, from: 4, to: 14, params: ['pr3', 'X1×X1'] }],
  ['Fi1[X1](ℬ(X1))', { code: RSErrorCode.invalidFilterArgumentType, from: 8, to: 13, params: ['Fi1', 'ℬℬ(X1)'] }],
  ['Fi1[1](S1)', { code: RSErrorCode.typesNotEqual, from: 4, to: 5, params: ['Z', 'ℬ(X1)'] }],
  ['Fi1[X1](ℬ(X1)×X1)', { code: RSErrorCode.typesNotEqual, from: 4, to: 6, params: ['ℬ(X1)', 'ℬℬ(X1)'] }],
  ['Fi3[X1](S1)', { code: RSErrorCode.invalidFilterArgumentType, from: 8, to: 10, params: ['Fi3', 'ℬ(X1×X1)'] }],
  ['Fi1[X1,X1](S1)', { code: RSErrorCode.invalidFilterArity, from: 0, to: 14 }],
  ['Fi1,2[X1](S1)', { code: RSErrorCode.typesNotEqual, from: 6, to: 8, params: ['ℬ(X1)', 'ℬ(X1×X1)'] }],
  ['red(X1)', { code: RSErrorCode.invalidReduce, from: 4, to: 6, params: ['ℬ(X1)'] }],
  ['debool(S3)', { code: RSErrorCode.invalidDebool, from: 7, to: 9, params: ['C1'] }],
  // Locals
  ['D{t ∈ X1 | 1=1}', { code: RSErrorCode.localNotUsed, from: 11, to: 14, params: ['t'] }],
  ['D{t ∈ X1 | t=t} ∪ D{t∈X1 | t=t}', { code: RSErrorCode.localDoubleDeclare, from: 20, to: 21, params: ['t'] }],
  ['D{t ∈ X1 | ∀t∈X1 t=t}', { code: RSErrorCode.localShadowing, from: 12, to: 13, params: ['t'] }],
  // Error popup
  ['1<card(X42)', { code: RSErrorCode.globalNotTyped, from: 7, to: 10, params: ['X42'] }],
  ['X42=X1', { code: RSErrorCode.globalNotTyped, from: 0, to: 3, params: ['X42'] }]
];

describe('TypeAuditor', () => {
  let typeContext: TypeContext;
  let auditor: TypeAuditor;
  let errors: RSErrorDescription[];

  beforeEach(() => {
    typeContext = setupTypeContext();
    auditor = new TypeAuditor(typeContext);
    errors = [];
  });

  function expectType(input: string, expectedType: string) {
    const ast = buildAST(input);
    expect(ast.hasError).toBe(false);
    const result = auditor.run(ast, false, error => errors.push(error));
    expect(labelType(result)).toBe(expectedType);
  }

  function expectError(input: string, expectedError: RSErrorDescription) {
    const ast = buildAST(input);
    expect(ast.hasError).toBe(false);
    auditor.run(ast, false, error => errors.push(error));
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatchObject(expectedError);
  }

  // .filter(([input]) => input === '[σ∈ℬ(Z×Z), π∈Z] I{(α, μ+π) | (α,μ):∈σ}')
  correctTypesData.forEach(([input, expectedType]) => {
    it(`Correct type for "${input}"`, () => expectType(input, expectedType));
  });

  errorData.forEach(([input, expectedError]) => {
    it(`Error for "${input as string}"`, () => expectError(input as string, expectedError as RSErrorDescription));
  });

  it('Templated function', () => {
    typeContext.set('F2', {
      typeID: TypeID.function,
      result: bool(basic('R1')),
      args: [
        { alias: 'a', type: bool(basic('R1')) },
        { alias: 'b', type: basic('R1') }
      ]
    });
    expectType('F2[ℬ(X1), X1]', 'ℬℬ(X1)');
    expectType('F2[Z, 1]', 'ℬ(Z)');
    expectType('F2[Z, S3]', 'ℬ(C1)');
    expectType('F2[{∅}, ∅]', 'ℬℬ(R0)');
    expectError('F2[X1, ℬ(X1)]', {
      code: RSErrorCode.invalidArgumentType,
      from: 7,
      to: 12,
      params: ['b∈R1F2', 'ℬℬ(X1)']
    });
  });

  it('Templated nesting', () => {
    typeContext.set('F2', {
      typeID: TypeID.function,
      result: bool(basic('R1')),
      args: [
        { alias: 'a', type: basic('R1') },
        {
          alias: 'b',
          type: {
            typeID: TypeID.tuple,
            factors: [basic('R1'), basic('R2')]
          }
        }
      ]
    });
    expectType('[a∈R2, b∈R2×R1] F2[a, b]', '[R2, R2×R1] → ℬ(R2)');
    expectType('[a∈R3, b∈R3×R4] F2[a, b]', '[R3, R3×R4] → ℬ(R3)');
  });

  it('Reports token end positions for semantic errors', () => {
    const ast = buildAST('X42');
    auditor.run(ast, false, error => errors.push(error));
    expect(errors[0]).toMatchObject({ code: RSErrorCode.globalNotTyped, from: 0, to: 3 });
  });
});
