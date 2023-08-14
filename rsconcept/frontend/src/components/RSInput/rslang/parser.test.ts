import { printTree } from '../../../utils/print-lezer-tree';
import { parser } from './parser';

const testData = [
  ['a1', '[Expression[Local[Index]]]'],
  ['A1', '[Expression[Global]]'],
  ['∅', '[Expression[Literal]]'],
  ['Z', '[Expression[Literal]]'],
  ['1', '[Expression[Literal]]'],
  ['12=41', '[Expression[LogicPredicate[Literal][=][Literal]]]'],
  ['0-5', '[Expression[BinaryOperation[Literal][-][Literal]]]'],
  ['12+41', '[Expression[BinaryOperation[Literal][+][Literal]]]'],
  ['a1∪Z', '[Expression[BinaryOperation[Local[Index]][∪][Literal]]]'],
  ['ℬℬ(X1)', '[Expression[Boolean[ℬ][Boolean[ℬ][(][Global][)]]]]'],
  ['P2[S1]', '[Expression[PredicateCall[Predicate][[][Global][]]]]'],
  ['[σ∈R1×R1] F6[σ]', '[Expression[FunctionDeclaration[[][Local][∈][BinaryOperation[Radical][×][Radical]][]][FunctionCall[Function][[][Local][]]]]]'],
  ['D{ξ∈red(S1) | ξ=ξ}', '[Expression[Declarative[PrefixD][{][Variable[Local]][∈][TextFunctionExpression[TextFunction][(][Global][)]][LogicPredicate[Local][=][Local]][}]]]'],
];

describe('Testing RSParser', () => {
  it.each(testData)('Parse %p', 
  (input: string, expectedTree: string) => {
    const tree = parser.parse(input);
    expect(printTree(tree)).toBe(expectedTree);
  });
});
