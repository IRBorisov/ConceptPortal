import { describe, expect, it } from 'vitest';

import { printTree } from '@/utils/codemirror';

import { parser } from './parser';

const testSuccess = [
  ['a1', '[Expression[Setexpr[Local]]]'],
  ['A1', '[Expression[Setexpr[Global]]]'],
  ['∅', '[Expression[Setexpr[EmptySet]]]'],
  ['Z', '[Expression[Setexpr[IntegerSet]]]'],
  ['1', '[Expression[Setexpr[Integer]]]'],
  ['¬2=2', '[Expression[Logic[Logic_unary[¬][Logic[Logic_predicates[Setexpr[Integer]][=][Setexpr[Integer]]]]]]]'],
  ['12+41', '[Expression[Setexpr[Setexpr_binary[Setexpr[Integer]][+][Setexpr[Integer]]]]]'],
  ['1+2*5', '[Expression[Setexpr[Setexpr_binary[Setexpr[Integer]][+][Setexpr[Setexpr_binary[Setexpr[Integer]][*][Setexpr[Integer]]]]]]]'],
  ['a1∪Z', '[Expression[Setexpr[Setexpr_binary[Setexpr[Local]][∪][Setexpr[IntegerSet]]]]]'],
  ['pr1(S1)', '[Expression[Setexpr[SmallPr][(][Setexpr[Global]][)]]]'],
  ['Pr1,2(X1)', '[Expression[Setexpr[BigPr][(][Setexpr[Global]][)]]]'],
  ['debool(X1)', '[Expression[Setexpr[Debool][(][Setexpr[Global]][)]]]'],
  ['Fi1,2[ξ, ξ](ξ)', '[Expression[Setexpr[Filter_expression[Filter][[][Setexpr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][]][(][Setexpr[Local]][)]]]]'],
  ['ℬℬ(X1)', '[Expression[Setexpr[Boolean[ℬ][Boolean[ℬ][(][Setexpr[Global]][)]]]]]'],
  ['P2[S1]', '[Expression[Logic[Logic_unary[Predicate][[][Setexpr[Global]][]]]]]'],
  ['[σ∈R1×R1] F6[σ]', '[Expression[Function_decl[[][Arguments[Declaration[Local][∈][Setexpr[Setexpr_binary[Setexpr[Radical]][×][Setexpr[Radical]]]]]][]][Setexpr[Function][[][Setexpr[Local]][]]]]]'],
  ['D{ξ∈red(S1) | ξ=ξ}', '[Expression[Setexpr[Declarative[PrefixD][{][Variable[Local]][∈][Setexpr[Red][(][Setexpr[Global]][)]][|][Logic[Logic_predicates[Setexpr[Local]][=][Setexpr[Local]]]][}]]]]'],
  [
    'I{(σ, γ) | σ:∈X1; γ:=F1[σ]; P1[σ, γ]}',
    '[Expression[Setexpr[Imperative[PrefixI][{][Setexpr[Tuple[(][Setexpr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][)]]][|][Imp_blocks[Imp_blocks[Imp_blocks[Logic[Logic_predicates[Variable[Local]][:∈][Setexpr[Global]]]]][;][Logic[Logic_predicates[Variable[Local]][:=][Setexpr[Function][[][Setexpr[Local]][]]]]]][;][Logic[Logic_unary[Predicate][[][Setexpr_enum_min2[Setexpr[Local]][,][Setexpr[Local]]][]]]]][}]]]]'
  ],
  [
    'R{ξ:=D1 | F1[ξ]≠∅ | ξ∪F1[ξ]}',
    '[Expression[Setexpr[Recursion[PrefixR][{][Variable[Local]][:=][Setexpr[Global]][|][Logic[Logic_predicates[Setexpr[Function][[][Setexpr[Local]][]]][≠][Setexpr[EmptySet]]]][|][Setexpr[Setexpr_binary[Setexpr[Local]][∪][Setexpr[Function][[][Setexpr[Local]][]]]]][}]]]]'
  ],
  ['∀ξ∈∅ 1=1', '[Expression[Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[EmptySet]][Logic[Logic_predicates[Setexpr[Integer]][=][Setexpr[Integer]]]]]]]]'],
  [
    '∀ξ1∈β (ξ1≠∅ & ∀ξ2∈β ξ1∩ξ2=∅)',
    '[Expression[Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[Local]][Logic[(][Logic[Logic_binary[Logic[Logic_predicates[Setexpr[Local]][≠][Setexpr[EmptySet]]]][&][Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[Local]][Logic[Logic_predicates[Setexpr[Setexpr_binary[Setexpr[Local]][∩][Setexpr[Local]]]][=][Setexpr[EmptySet]]]]]]]]][)]]]]]]'
  ],
  ['∀α1∈α2 1=1', '[Expression[Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[Local]][Logic[Logic_predicates[Setexpr[Integer]][=][Setexpr[Integer]]]]]]]]'],
];

const testError = [
  ['', '[Expression[⚠]]'],
  ['!', '[Expression[⚠]]'],
  ['∀a∈X1 D{b∈S1| 1=1}', '[Expression[Logic[Logic_unary[Logic_quantor[∀][Variable_pack[Variable[Local]]][∈][Setexpr[Global]][Logic[Logic_predicates[Setexpr[Declarative[PrefixD][{][Variable[Local]][∈][Setexpr[Global]][|][Logic[Logic_predicates[Setexpr[Integer]][=][Setexpr[Integer]]]][}]]][⚠]]]]]]]']
];

describe('Testing RSParser correct inputs', () => {
  testSuccess.forEach(([input, expectedTree]) => {
    it(`Parse "${input}"`, () => {
      const tree = parser.parse(input);
      expect(printTree(tree)).toBe(expectedTree);
    });
  });
});

describe('Testing RSParser error inputs', () => {
  testError.forEach(([input, expectedTree]) => {
    it(`Parse "${input}"`, () => {
      const tree = parser.parse(input);
      expect(printTree(tree)).toBe(expectedTree);
    });
  });
});
