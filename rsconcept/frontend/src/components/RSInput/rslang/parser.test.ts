import { printTree } from '@/utils/codemirror';

import { parser } from './parser';

const testData = [
  ['a1', '[Expression[Local]]'],
  ['A1', '[Expression[Global]]'],
  ['∅', '[Expression[Literal]]'],
  ['Z', '[Expression[Literal]]'],
  ['1', '[Expression[Literal]]'],
  ['12<41', '[Expression[Literal][<][Literal]]'],
  ['12=41', '[Expression[Literal][=][Literal]]'],
  ['ξ=ξ', '[Expression[Local][=][Local]]'],
  ['0-5', '[Expression[Literal][-][Literal]]'],
  ['¬2=2', '[Expression[¬][Literal][=][Literal]]'],
  ['12+41', '[Expression[Literal][+][Literal]]'],
  ['1+2*5', '[Expression[Literal][+][Literal][*][Literal]]'],
  ['a1∪Z', '[Expression[Local][∪][Literal]]'],
  ['Pr1(X1)', '[Expression[TextFunction[ComplexIndex]][(][Global][)]]'],
  ['Pr11(X1)', '[Expression[TextFunction[ComplexIndex]][(][Global][)]]'],
  ['Pr11,21(X1)', '[Expression[TextFunction[ComplexIndex]][(][Global][)]]'],
  ['pr1(S1)', '[Expression[TextFunction[ComplexIndex]][(][Global][)]]'],
  ['Pr1,2(X1)', '[Expression[TextFunction[ComplexIndex]][(][Global][)]]'],
  ['card(X1)', '[Expression[TextFunction][(][Global][)]]'],
  ['red(X1)', '[Expression[TextFunction][(][Global][)]]'],
  ['bool(X1)', '[Expression[TextFunction][(][Global][)]]'],
  ['debool(X1)', '[Expression[TextFunction][(][Global][)]]'],
  ['Fi1,2[ξ, ξ](ξ)', '[Expression[Filter][ComplexIndex][[][Local][Local][]][(][Local][)]]'],
  ['ℬℬ(X1)', '[Expression[ℬ][ℬ][(][Global][)]]'],
  ['P2[S1]', '[Expression[Predicate][[][Global][]]]'],
  ['[σ∈R1×R1] F6[σ]', '[Expression[[][Local][∈][Radical][×][Radical][]][Function][[][Local][]]]'],
  ['D{ξ∈red(S1) | ξ=ξ}', '[Expression[PrefixD][{][Local][∈][TextFunction][(][Global][)][|][Local][=][Local][}]]'],
  [
    'I{(σ, γ) | σ:∈X1; γ:=F1[σ]; P1[σ, γ]}',
    '[Expression[PrefixI][{][(][Local][Local][)][|][Local][:∈][Global][;][Local][:=][Function][[][Local][]][;][Predicate][[][Local][Local][]][}]]'
  ],
  [
    'R{ξ:=D1 | F1[ξ]≠∅ | ξ∪F1[ξ]}',
    '[Expression[PrefixR][{][Local][:=][Global][|][Function][[][Local][]][≠][Literal][|][Local][∪][Function][[][Local][]][}]]'
  ],
  ['∀ξ∈∅ 1=1', '[Expression[∀][Local][∈][Literal][Literal][=][Literal]]'],
  [
    '∀ξ1∈β (ξ1≠∅ & ∀ξ2∈β ξ1∩ξ2=∅)',
    '[Expression[∀][Local][∈][Local][(][Local][≠][Literal][&][∀][Local][∈][Local][Local][∩][Local][=][Literal][)]]'
  ],
  ['∀α1∈α2 1=1', '[Expression[∀][Local][∈][Local][Literal][=][Literal]]']
];

describe('Testing RSParser', () => {
  it.each(testData)('Parse %p', (input: string, expectedTree: string) => {
    // NOTE: use strict parser to determine exact error position
    // const tree = parser.configure({strict: true}).parse(input);
    const tree = parser.parse(input);
    expect(printTree(tree)).toBe(expectedTree);
  });
});
