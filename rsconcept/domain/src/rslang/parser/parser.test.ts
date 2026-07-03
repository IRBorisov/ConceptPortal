import { describe, expect, it } from 'vitest';

import { buildTree, printTree } from '../../parsing';
import { RSErrorCode, type RSErrorDescription } from '../error';
import { TypeClass } from '../semantic/typification';

import { parser } from './parser';
import { extractSyntaxErrors } from './syntax-errors';

const testSuccess = [
  ['a1', '[Expression[Setexpr[Local]]]'],
  ['A1', '[Expression[Setexpr[Global]]]'],
  ['∅', '[Expression[Setexpr[EmptySet]]]'],
  ['Z', '[Expression[Setexpr[IntegerSet]]]'],
  ['1', '[Expression[Setexpr[Integer]]]'],
  ['¬2=2', '[Expression[Logic[Logic_unary[¬][Logic[Logic_predicates[Setexpr[Integer]][=][Setexpr[Integer]]]]]]]'],
  ['12+41', '[Expression[Setexpr[Setexpr_binary[Setexpr[Integer]][+][Setexpr[Integer]]]]]'],
  [
    '1+2*5',
    '[Expression[Setexpr[Setexpr_binary[Setexpr[Integer]][+][Setexpr[Setexpr_binary[Setexpr[Integer]][*][Setexpr[Integer]]]]]]]'
  ],
  ['a1∪Z', '[Expression[Setexpr[Setexpr_binary[Setexpr[Local]][∪][Setexpr[IntegerSet]]]]]'],
  ['pr1(S1)', '[Expression[Setexpr[SmallPr][(][Setexpr[Global]][)]]]'],
  ['Pr1,2(X1)', '[Expression[Setexpr[BigPr][(][Setexpr[Global]][)]]]'],
  ['debool(X1)', '[Expression[Setexpr[Debool][(][Setexpr[Global]][)]]]'],
  [
    'Fi1,2[ξ, ξ](ξ)',
    '[Expression[Setexpr[Filter_expression[Filter][[][Expr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][]][(][Setexpr[Local]][)]]]]'
  ],
  ['ℬℬ(X1)', '[Expression[Setexpr[Boolean[ℬ][Boolean[ℬ][(][Setexpr[Global]][)]]]]]'],
  ['P2[S1]', '[Expression[Logic[Logic_unary[Predicate][[][Setexpr[Global]][]]]]]'],
  [
    '[σ∈R1×R1] F6[σ]',
    '[Expression[Function_decl[[][Arguments[Declaration[Variable[Local]][∈][Setexpr[Setexpr_binary[Setexpr[Radical]][×][Setexpr[Radical]]]]]][]][Setexpr[Function][[][Setexpr[Local]][]]]]]'
  ],
  [
    '[(α,β)∈Z×X1] (α,β)',
    '[Expression[Function_decl[[][Arguments[Declaration[Variable[Tuple[(][Expr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][)]]][∈][Setexpr[Setexpr_binary[Setexpr[IntegerSet]][×][Setexpr[Global]]]]]][]][Setexpr[Tuple[(][Expr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][)]]]]]'
  ],
  [
    'D{ξ∈red(S1) | ξ=ξ}',
    '[Expression[Setexpr[Declarative[PrefixD][{][Variable[Local]][∈][Setexpr[Red][(][Setexpr[Global]][)]][|][Logic[Logic_predicates[Setexpr[Local]][=][Setexpr[Local]]]][}]]]]'
  ],
  [
    'I{(σ, γ) | σ:∈X1; γ:=F1[σ]; P1[σ, γ]}',
    '[Expression[Setexpr[Imperative[PrefixI][{][Setexpr[Tuple[(][Expr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][)]]][|][Imp_blocks[Imp_blocks[Imp_blocks[Logic[Logic_predicates[Variable[Local]][:∈][Setexpr[Global]]]]][;][Logic[Logic_predicates[Variable[Local]][:=][Setexpr[Function][[][Setexpr[Local]][]]]]]][;][Logic[Logic_unary[Predicate][[][Expr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][]]]]][}]]]]'
  ],
  [
    'R{ξ:=D1 | F1[ξ]≠∅ | ξ∪F1[ξ]}',
    '[Expression[Setexpr[Recursion[PrefixR][{][Variable[Local]][:=][Setexpr[Global]][|][Logic[Logic_predicates[Setexpr[Function][[][Setexpr[Local]][]]][≠][Setexpr[EmptySet]]]][|][Setexpr[Setexpr_binary[Setexpr[Local]][∪][Setexpr[Function][[][Setexpr[Local]][]]]]][}]]]]'
  ],
  [
    '∀ξ∈∅ 1=1',
    '[Expression[Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[EmptySet]][Logic[Logic_predicates[Setexpr[Integer]][=][Setexpr[Integer]]]]]]]]'
  ],
  [
    '∀ξ1∈β (ξ1≠∅ & ∀ξ2∈β ξ1∩ξ2=∅)',
    '[Expression[Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[Local]][Logic[(][Logic[Logic_binary[Logic[Logic_predicates[Setexpr[Local]][≠][Setexpr[EmptySet]]]][&][Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[Local]][Logic[Logic_predicates[Setexpr[Setexpr_binary[Setexpr[Local]][∩][Setexpr[Local]]]][=][Setexpr[EmptySet]]]]]]]]][)]]]]]]'
  ],
  [
    '∀α1∈α2 1=1',
    '[Expression[Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[Local]][Logic[Logic_predicates[Setexpr[Integer]][=][Setexpr[Integer]]]]]]]]'
  ]
];

const testError = [
  ['', '[Expression[⚠]]'],
  ['!', '[Expression[⚠]]']
];

const testErrorData = [
  ['(', { code: RSErrorCode.missingCloseBracket, from: 0, to: 1, params: ['('] }],
  ['{X1', { code: RSErrorCode.missingCloseBracket, from: 0, to: 1, params: ['{'] }],
  ['∀∈X1 (1=1)', { code: RSErrorCode.expectedLocal, from: 1, to: 1 }],
  [
    '∀σ∈S2 ∀(ξ,δ,π)∈σ (ξ∈δ & δ∈{pr1(π), pr2(π)}',
    { code: RSErrorCode.missingCloseBracket, from: 17, to: 18, params: ['('] }
  ],
  ['Fi1[X1) (X1)', { code: RSErrorCode.bracketMismatch, from: 6, to: 7, params: [']', ')'] }],
  [')X1', { code: RSErrorCode.missingOpenBracket, from: 0, to: 1, params: [')'] }],
  ['Fi1[X1(X1)', { code: RSErrorCode.missingCloseBracket, from: 3, to: 4, params: ['['] }],
  ['F1', { code: RSErrorCode.globalFuncWithoutArgs, from: 0, to: 2, params: ['F1'] }],
  ['P1', { code: RSErrorCode.globalFuncWithoutArgs, from: 0, to: 2, params: ['P1'] }],
  ['F1[]', { code: RSErrorCode.globalFuncWithoutArgs, from: 0, to: 2, params: ['F1'] }],
  ['!', { code: RSErrorCode.forbiddenCharacter, from: 0, to: 1, params: ['!'] }],
  ['?', { code: RSErrorCode.forbiddenCharacter, from: 0, to: 1, params: ['?'] }],
  ['16=2^4', { code: RSErrorCode.forbiddenCharacter, from: 4, to: 5, params: ['^'] }],
  ['16=2/4', { code: RSErrorCode.forbiddenCharacter, from: 4, to: 5, params: ['/'] }],
  ['Fi1(S1)', { code: RSErrorCode.invalidFilterSyntax, from: 0, to: 4 }],
  ['[α∈ℬ(X1×X1)]', { code: RSErrorCode.expectedFunctionBody, from: 12, to: 12 }]
];

const testIncompleteFormalData = [
  ['[α∈ℬ(X1×X1)]', TypeClass.function, { code: RSErrorCode.expectedExpressionBody, from: 12, to: 12 }],
  ['[σ∈S1]', TypeClass.predicate, { code: RSErrorCode.expectedLogicBody, from: 6, to: 6 }],
  ['[ξ∈X1]', TypeClass.logic, { code: RSErrorCode.expectedLogicBody, from: 6, to: 6 }],
  ['∀α∈X1', TypeClass.logic, { code: RSErrorCode.expectedQuantifierBody, from: 5, to: 5 }],
  ['∃β∈S2', TypeClass.logic, { code: RSErrorCode.expectedQuantifierBody, from: 5, to: 5 }],
  ['∀α', TypeClass.logic, { code: RSErrorCode.expectedQuantifierDomain, from: 2, to: 2 }],
  ['∀α∈', TypeClass.logic, { code: RSErrorCode.expectedQuantifierDomain, from: 3, to: 3 }],
  ['D{ξ∈X1 |', TypeClass.function, { code: RSErrorCode.expectedDeclarativeBody, from: 8, to: 8 }],
  ['D{ξ∈X1 |}', TypeClass.function, { code: RSErrorCode.expectedDeclarativeBody, from: 8, to: 8 }],
  ['D{ξ∈X1}', TypeClass.function, { code: RSErrorCode.expectedDeclarativeBody, from: 6, to: 7 }],
  ['I{(σ, γ) |}', TypeClass.function, { code: RSErrorCode.expectedImperativeBody, from: 10, to: 10 }],
  ['I{(σ, γ)}', TypeClass.function, { code: RSErrorCode.expectedImperativeBody, from: 8, to: 9 }],
  ['I{(σ, γ) | σ:∈X1;}', TypeClass.function, { code: RSErrorCode.expectedImperativeBody, from: 17, to: 17 }],
  ['R{ξ:=D1 |}', TypeClass.function, { code: RSErrorCode.expectedRecursiveBody, from: 9, to: 9 }],
  ['R{ξ:=D1 | F1[ξ]≠∅ |}', TypeClass.function, { code: RSErrorCode.expectedRecursiveBody, from: 19, to: 19 }],
  ['R{ξ:=D1}', TypeClass.function, { code: RSErrorCode.expectedRecursiveBody, from: 7, to: 8 }]
] as const;

const testSpecifiedSyntaxData = [
  ['1=', { code: RSErrorCode.expectedRightOperand, from: 2, to: 2 }],
  ['1+', { code: RSErrorCode.expectedRightOperand, from: 2, to: 2 }],
  ['1=1&', { code: RSErrorCode.expectedRightOperand, from: 4, to: 4 }],
  ['1=1⇒', { code: RSErrorCode.expectedRightOperand, from: 4, to: 4 }],
  ['¬', { code: RSErrorCode.expectedUnaryOperand, from: 1, to: 1 }],
  ['ℬ()', { code: RSErrorCode.expectedRightOperand, from: 2, to: 2 }],
  ['P1(S1)', { code: RSErrorCode.globalFuncParenCall, from: 0, to: 2, params: ['P1'] }],
  ['P1()', { code: RSErrorCode.globalFuncParenCall, from: 0, to: 2, params: ['P1'] }],
  ['F1(S1)', { code: RSErrorCode.globalFuncParenCall, from: 0, to: 2, params: ['F1'] }],
  ['P1[S1, ]', { code: RSErrorCode.expectedArgument, from: 7, to: 7 }],
  ['X1∈', { code: RSErrorCode.expectedRightOperand, from: 3, to: 3 }],
  ['ξ:=', { code: RSErrorCode.expectedRightOperand, from: 3, to: 3 }]
] as const;

const testUnknownSyntaxData = [
  ['1==1', { code: RSErrorCode.unknownSyntax, from: 0, to: 2 }],
  ['=1', { code: RSErrorCode.unknownSyntax, from: 0, to: 1 }],
  ['∈X1', { code: RSErrorCode.unknownSyntax, from: 0, to: 1 }],
  ['∀', { code: RSErrorCode.unknownSyntax, from: 0, to: 1 }],
  ['∃∈X1', { code: RSErrorCode.unknownSyntax, from: 0, to: 1 }],
  ['&1=1', { code: RSErrorCode.unknownSyntax, from: 0, to: 1 }],
  ['P1[,S1]', { code: RSErrorCode.unknownSyntax, from: 3, to: 4 }],
  ['(,β)', { code: RSErrorCode.unknownSyntax, from: 1, to: 1 }],
  ['(α,β,)', { code: RSErrorCode.unknownSyntax, from: 1, to: 5 }],
  ['F1[S1][S2]', { code: RSErrorCode.unknownSyntax, from: 6, to: 10 }],
  [':∈X1', { code: RSErrorCode.unknownSyntax, from: 0, to: 2 }]
] as const;

describe('Testing RSParser correct inputs', () => {
  testSuccess.forEach(([input, expectedTree]) => {
    it(`Parse "${input}"`, () => {
      const tree = parser.parse(input);
      expect(printTree(tree)).toBe(expectedTree);
    });
  });
});

describe('Testing RSParser error inputs AST', () => {
  testError.forEach(([input, expectedTree]) => {
    it(`Parse "${input}"`, () => {
      const tree = parser.parse(input);
      expect(printTree(tree)).toBe(expectedTree);
    });
  });
});

describe('Testing RSParser error data', () => {
  testErrorData.forEach(([input, expectedError]) => {
    it(`Parse "${input as string}"`, () => {
      const tree = parser.parse(input as string);
      const ast = buildTree(tree.cursor());
      expect(ast.hasError).toBe(true);
      const errors: RSErrorDescription[] = [];
      extractSyntaxErrors(ast, input as string, error => errors.push(error));
      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject(expectedError as RSErrorDescription);
    });
  });

  testIncompleteFormalData.forEach(([input, expected, expectedError]) => {
    it(`Parse incomplete formal "${input}" for ${expected}`, () => {
      const tree = parser.parse(input);
      const ast = buildTree(tree.cursor());
      const errors: RSErrorDescription[] = [];
      extractSyntaxErrors(ast, input, error => errors.push(error), false, { expected });
      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject(expectedError);
    });
  });

  testSpecifiedSyntaxData.forEach(([input, expectedError]) => {
    it(`Parse specified syntax "${input}"`, () => {
      const tree = parser.parse(input);
      const ast = buildTree(tree.cursor());
      const errors: RSErrorDescription[] = [];
      extractSyntaxErrors(ast, input, error => errors.push(error));
      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject(expectedError);
    });
  });

  testUnknownSyntaxData.forEach(([input, expectedError]) => {
    it(`Parse unknown syntax "${input}"`, () => {
      const tree = parser.parse(input);
      const ast = buildTree(tree.cursor());
      const errors: RSErrorDescription[] = [];
      extractSyntaxErrors(ast, input, error => errors.push(error));
      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchObject(expectedError);
    });
  });

  it('Quantor expressions', () => {
    const input = '∀X1∈X1 (1=1)';
    const tree = parser.parse(input);
    const ast = buildTree(tree.cursor());
    const errors: RSErrorDescription[] = [];
    extractSyntaxErrors(ast, input, error => errors.push(error));
    expect(errors.length).toBe(2);
    expect(errors[1]).toMatchObject({ code: RSErrorCode.expectedLocal, from: 3, to: 3 });
  });

  it('Includes end position for ranged syntax errors', () => {
    const input = '∀∈X1 (1=1)';
    const tree = parser.parse(input);
    const ast = buildTree(tree.cursor());
    const errors: RSErrorDescription[] = [];
    extractSyntaxErrors(ast, input, error => errors.push(error));
    expect(errors[0]).toMatchObject({
      code: RSErrorCode.expectedLocal,
      from: 1,
      to: 1
    });
  });

  it('Reports true double parentheses only', () => {
    const withDoubleParentheses = 'R{ξ:=S1 | 1=1 | ξ∪((S2))}';
    const treeDouble = parser.parse(withDoubleParentheses);
    const astDouble = buildTree(treeDouble.cursor());
    const errorsDouble: RSErrorDescription[] = [];
    extractSyntaxErrors(astDouble, withDoubleParentheses, error => errorsDouble.push(error));

    expect(errorsDouble.some(error => error.code === RSErrorCode.doubleParenthesis)).toBe(true);
  });

  it('Does not report tuple as double parentheses', () => {
    const withTuple = 'R{ξ:={((S3, ∅),0)}| pr1(F8[ξ])∩S2=∅  | ξ∪((),card(ξ))}';
    const treeTuple = parser.parse(withTuple);
    const astTuple = buildTree(treeTuple.cursor());
    const errorsTuple: RSErrorDescription[] = [];
    extractSyntaxErrors(astTuple, withTuple, error => errorsTuple.push(error));

    expect(errorsTuple.some(error => error.code === RSErrorCode.doubleParenthesis)).toBe(false);
  });

  it('Does not treat malformed generator body as incomplete', () => {
    const input = 'D{ξ∈X1 | P1[';
    const tree = parser.parse(input);
    const ast = buildTree(tree.cursor());
    const errors: RSErrorDescription[] = [];
    extractSyntaxErrors(ast, input, error => errors.push(error));
    expect(errors.some(error => error.code === RSErrorCode.expectedDeclarativeBody)).toBe(false);
  });

  it('Reports incomplete quantifier only for innermost missing body', () => {
    const input = '∀α∈X1 ∀β∈X2';
    const tree = parser.parse(input);
    const ast = buildTree(tree.cursor());
    const errors: RSErrorDescription[] = [];
    extractSyntaxErrors(ast, input, error => errors.push(error), false, { expected: TypeClass.logic });
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatchObject({
      code: RSErrorCode.expectedQuantifierBody,
      from: input.length,
      to: input.length
    });
  });

  it('Reports a single forbidden-character error for exponentiation', () => {
    const input = '[σ∈S2]I{γ | ξ:∈ℬ(σ); γ:=(ξ×{1})∪((σ\\ξ)×{0}); 16=2^4}';
    const tree = parser.parse(input);
    const ast = buildTree(tree.cursor());
    const errors: RSErrorDescription[] = [];
    extractSyntaxErrors(ast, input, error => errors.push(error));

    expect(errors).toEqual([
      {
        code: RSErrorCode.forbiddenCharacter,
        from: input.indexOf('^'),
        to: input.indexOf('^') + 1,
        params: ['^']
      }
    ]);
  });
});
