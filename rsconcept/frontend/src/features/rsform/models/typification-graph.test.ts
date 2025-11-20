import { describe, expect, it } from 'vitest';

import { TypificationGraph } from './typification-graph';

const typificationData = [
  ['', ''],
  ['X1', 'X1'],
  ['Z', 'Z'],
  ['R1', 'R1'],
  ['C1', 'C1'],
  ['C1×X1', 'C1 X1 C1×X1'],
  ['X1×X1', 'X1 X1×X1'],
  ['X1×X1×X1', 'X1 X1×X1×X1'],
  ['ℬ(X1)', 'X1 ℬ(X1)'],
  ['ℬℬ(X1)', 'X1 ℬ(X1) ℬℬ(X1)'],
  ['ℬℬ(X1×X2)', 'X1 X2 X1×X2 ℬ(X1×X2) ℬℬ(X1×X2)'],
  ['ℬ((X1×X1)×X2)', 'X1 X1×X1 X2 (X1×X1)×X2 ℬ((X1×X1)×X2)'],
  ['ℬ(ℬ(X1)×ℬ(X1))', 'X1 ℬ(X1) ℬ(X1)×ℬ(X1) ℬ(ℬ(X1)×ℬ(X1))'],
  [
    'ℬ(ℬ((X1×ℬ(X1))×X1)×X2)',
    'X1 ℬ(X1) X1×ℬ(X1) (X1×ℬ(X1))×X1 ℬ((X1×ℬ(X1))×X1) X2 ℬ((X1×ℬ(X1))×X1)×X2 ℬ(ℬ((X1×ℬ(X1))×X1)×X2)'
  ]
];

describe('Testing parsing typifications', () => {
  typificationData.forEach(([input, expected]) =>
    it(`Typification parsing ${input}`, () => {
      const graph = new TypificationGraph();
      graph.addConstituenta('X1', input, []);
      const nodeText = graph.nodes.map(node => node.text).join(' ');
      expect(nodeText).toBe(expected);
    })
  );
});

describe('Testing constituents parsing', () => {
  it('simple expression no arguments', () => {
    const graph = new TypificationGraph();
    graph.addConstituenta('X1', 'ℬ(X1)', []);

    expect(graph.nodes.length).toBe(2);
    expect(graph.nodes.at(-1)?.annotations).toStrictEqual(['X1']);
  });

  it('no expression with single argument', () => {
    const graph = new TypificationGraph();
    graph.addConstituenta('X1', '', [{ alias: 'a', typification: 'X1' }]);
    const nodeText = graph.nodes.map(node => node.text).join(' ');

    expect(nodeText).toBe('X1 ℬ(X1)');
    expect(graph.nodes.at(-1)?.annotations).toStrictEqual(['X1']);
  });

  it('no expression with multiple arguments', () => {
    const graph = new TypificationGraph();
    graph.addConstituenta('X1', '', [
      { alias: 'a', typification: 'X1' },
      { alias: 'b', typification: 'R1×X1' }
    ]);
    const nodeText = graph.nodes.map(node => node.text).join(' ');

    expect(nodeText).toBe('X1 R1 R1×X1 X1×(R1×X1) ℬ(X1×(R1×X1))');
    expect(graph.nodes.at(-1)?.annotations).toStrictEqual(['X1']);
  });

  it('expression with multiple arguments', () => {
    const graph = new TypificationGraph();
    graph.addConstituenta('X1', 'ℬ(X2×Z)', [
      { alias: 'a', typification: 'X1' },
      { alias: 'b', typification: 'R1×X1' }
    ]);
    const nodeText = graph.nodes.map(node => node.text).join(' ');

    expect(nodeText).toBe('X1 R1 R1×X1 X1×(R1×X1) X2 Z X2×Z ℬ(X2×Z) (X1×(R1×X1))×ℬ(X2×Z) ℬ((X1×(R1×X1))×ℬ(X2×Z))');
    expect(graph.nodes.at(-1)?.annotations).toStrictEqual(['X1']);
  });
});
