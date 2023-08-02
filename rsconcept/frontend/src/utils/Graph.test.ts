import { Graph } from './Graph';

describe('Testing Graph constuction', () => {
  test('empty Graph should be empty', () => {
    const graph = new Graph();
    expect(graph.nodes.size).toBe(0);
  });

  test('adding edges should create nodes', () => {
    const graph = new Graph();
    graph.addEdge(13, 37);
    expect([... graph.nodes.keys()]).toStrictEqual([13, 37]);

    graph.addEdge(13, 38);
    expect([... graph.nodes.keys()]).toStrictEqual([13, 37, 38]);
  });

  test('creating from array', () => {
    const graph = new Graph([[1, 2], [3], [4, 1]]);
    expect([... graph.nodes.keys()]).toStrictEqual([1, 2, 3, 4]);
    expect([... graph.nodes.get(1)!.outputs]).toStrictEqual([2]);
  });
});

describe('Testing Graph queries', () => {
  test('expand outputs', () => {
    const graph = new Graph([[1, 2], [2, 3], [2, 5], [5, 6], [6, 1], [7]]);
    expect(graph.expandOutputs([])).toStrictEqual([]);
    expect(graph.expandOutputs([3])).toStrictEqual([]);
    expect(graph.expandOutputs([7])).toStrictEqual([]);
    expect(graph.expandOutputs([2, 5])).toStrictEqual([3, 6, 1]);
  });

  test('expand into unique array', () => {
    const graph = new Graph([[1, 2], [1, 3], [2, 5], [3, 5]]);
    expect(graph.expandOutputs([1])).toStrictEqual([2, 3 ,5]);
  });

  test('expand inputs', () => {
    const graph = new Graph([[1, 2], [2, 3], [2, 5], [5, 6], [6, 1], [7]]);
    expect(graph.expandInputs([])).toStrictEqual([]);
    expect(graph.expandInputs([7])).toStrictEqual([]);
    expect(graph.expandInputs([6])).toStrictEqual([5, 2, 1]);
  });

});