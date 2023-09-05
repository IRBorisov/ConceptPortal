import { printTree } from '../../../utils/print-lezer-tree';
import { parser } from './parser';

const testData = [
  ['a1', '[Expression[Local[Index]]]'],
  ['A1', '[Expression[Global]]'],
  ['∅', '[Expression[Literal]]'],
  ['Z', '[Expression[Literal]]'],
  ['1', '[Expression[Literal]]'],
  ['12<41', '[Expression[LogicPredicate[Literal][<][Literal]]]'],
  ['12=41', '[Expression[LogicPredicate[Literal][=][Literal]]]'],
  ['ξ=ξ', '[Expression[LogicPredicate[Local][=][Local]]]'],
  ['0-5', '[Expression[BinaryOperation[Literal][-][Literal]]]'],
  ['¬2=2', '[Expression[LogicNegation[¬][LogicPredicate[Literal][=][Literal]]]]'],
  ['12+41', '[Expression[BinaryOperation[Literal][+][Literal]]]'],
  ['1+2*5', '[Expression[BinaryOperation[BinaryOperation[Literal][+][Literal]][*][Literal]]]'],
  ['a1∪Z', '[Expression[BinaryOperation[Local[Index]][∪][Literal]]]'],
  ['Pr1(X1)', '[Expression[TextFunctionExpression[TextFunction[ComplexIndex]][(][Global][)]]]'],
  ['Pr11(X1)', '[Expression[TextFunctionExpression[TextFunction[ComplexIndex]][(][Global][)]]]'],
  ['Pr11,21(X1)', '[Expression[TextFunctionExpression[TextFunction[ComplexIndex]][(][Global][)]]]'],
  ['pr1(S1)', '[Expression[TextFunctionExpression[TextFunction[ComplexIndex]][(][Global][)]]]'],
  ['Pr1,2(X1)', '[Expression[TextFunctionExpression[TextFunction[ComplexIndex]][(][Global][)]]]'],
  ['card(X1)', '[Expression[TextFunctionExpression[TextFunction][(][Global][)]]]'],
  ['red(X1)', '[Expression[TextFunctionExpression[TextFunction][(][Global][)]]]'],
  ['bool(X1)', '[Expression[TextFunctionExpression[TextFunction][(][Global][)]]]'],
  ['debool(X1)', '[Expression[TextFunctionExpression[TextFunction][(][Global][)]]]'],
  ['Fi1,2[ξ, ξ](ξ)', '[Expression[TextFunctionExpression[Filter[ComplexIndex]][[][Local][Local][]][(][Local][)]]]'],
  ['ℬℬ(X1)', '[Expression[Boolean[ℬ][Boolean[ℬ][(][Global][)]]]]'],
  ['P2[S1]', '[Expression[PredicateCall[Predicate][[][Global][]]]]'],
  ['[σ∈R1×R1] F6[σ]', '[Expression[FunctionDeclaration[[][Local][∈][BinaryOperation[Radical][×][Radical]][]][FunctionCall[Function][[][Local][]]]]]'],
  ['D{ξ∈red(S1) | ξ=ξ}', '[Expression[Declarative[PrefixD][{][Variable[Local]][∈][TextFunctionExpression[TextFunction][(][Global][)]][LogicPredicate[Local][=][Local]][}]]]'],
  ['I{(σ, γ) | σ:∈X1; γ:=F1[σ]; P1[σ, γ]}', '[Expression[Imperative[PrefixI][{][Tuple[(][Local][Local][)]][ImperativeBlocks[ImperativeBlocks[ImperativeBlocks[ImperativeIteration[Local][:∈][Global]]][ImperativeAssignment[Local][:=][FunctionCall[Function][[][Local][]]]]][ImperativeCondition[PredicateCall[Predicate][[][Local][Local][]]]]][}]]]'],
  ['R{ξ:=D1 | F1[ξ]≠∅ | ξ∪F1[ξ]}', '[Expression[Recursion[PrefixR][{][Variable[Local]][:=][Global][LogicPredicate[FunctionCall[Function][[][Local][]]][≠][Literal]][BinaryOperation[Local][∪][FunctionCall[Function][[][Local][]]]][}]]]'],
  ['∀ξ∈∅ 1=1', '[Expression[LogicQuantor[∀][QuantorVariable[Variable[Local]]][∈][Literal][LogicPredicate[Literal][=][Literal]]]]'],
  ['∀ξ1∈β (ξ1≠∅ & ∀ξ2∈β ξ1∩ξ2=∅)', '[Expression[LogicQuantor[∀][QuantorVariable[Variable[Local[Index]]]][∈][Local][(][LogicBinary[LogicPredicate[Local[Index]][≠][Literal]][&][LogicQuantor[∀][QuantorVariable[Variable[Local[Index]]]][∈][Local][LogicPredicate[BinaryOperation[Local[Index]][∩][Local[Index]]][=][Literal]]]][)]]]']
];

describe('Testing RSParser', () => {
  it.each(testData)('Parse %p', 
  (input: string, expectedTree: string) => {
    // NOTE: use strict parser to determine exact error position
    // const tree = parser.configure({strict: true}).parse(input);
    const tree = parser.parse(input);
    expect(printTree(tree)).toBe(expectedTree);
  });
});
