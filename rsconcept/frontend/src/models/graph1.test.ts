import { Graph } from './graph1';

describe('Testing Graph construction', () => {
  test('empty Graph should be empty', () => {
    const graph = new Graph();
    expect(graph.nodes.size).toBe(0);
  });

  test('adding edges should create nodes', () => {
    const graph = new Graph();
    graph.addEdge(13, 37);
    expect([...graph.nodes.keys()]).toStrictEqual([13, 37]);

    graph.addEdge(13, 38);
    expect([...graph.nodes.keys()]).toStrictEqual([13, 37, 38]);
  });

  test('creating from array', () => {
    const graph = new Graph([[1, 2], [3], [4, 1]]);
    expect([...graph.nodes.keys()]).toStrictEqual([1, 2, 3, 4]);
    expect([...graph.nodes.get(1)!.outputs]).toStrictEqual([2]);
  });

  test('cloning', () => {
    const graph = new Graph([[1, 2], [3], [4, 1]]);
    const clone = graph.clone();
    expect([...graph.nodes.keys()]).toStrictEqual([...clone.nodes.keys()]);
    expect([...graph.nodes.values()]).toStrictEqual([...clone.nodes.values()]);

    clone.removeNode(3);
    expect(clone.nodes.get(3)).toBeUndefined();
    expect(graph.nodes.get(3)).not.toBeUndefined();
  });
});

describe('Testing Graph editing', () => {
  test('removing edges should not remove nodes', () => {
    const graph = new Graph([[1, 2], [3], [4, 1]]);
    expect(graph.hasEdge(4, 1)).toBeTruthy();

    graph.removeEdge(5, 0);
    graph.removeEdge(4, 1);

    expect([...graph.nodes.keys()]).toStrictEqual([1, 2, 3, 4]);
    expect(graph.hasEdge(4, 1)).toBeFalsy();
  });

  test('folding node redirects edges', () => {
    const graph = new Graph([
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
      [3, 3]
    ]);
    graph.foldNode(3);
    expect(graph.hasNode(3)).toBeFalsy();
    expect(graph.hasEdge(1, 4)).toBeTruthy();
    expect(graph.hasEdge(1, 5)).toBeTruthy();
    expect(graph.hasEdge(2, 4)).toBeTruthy();
    expect(graph.hasEdge(2, 5)).toBeTruthy();
  });

  test('removing isolated nodes', () => {
    const graph = new Graph([[9, 1], [9, 2], [2, 1], [4, 3], [5, 9], [7], [8]]);
    graph.removeIsolated();
    expect([...graph.nodes.keys()]).toStrictEqual([9, 1, 2, 4, 3, 5]);
  });

  test('transitive reduction', () => {
    const graph = new Graph([
      [1, 3],
      [1, 2],
      [2, 3]
    ]);
    graph.transitiveReduction();
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(2, 3)).toBeTruthy();
    expect(graph.hasEdge(1, 3)).toBeFalsy();
  });
});

describe('Testing Graph sort', () => {
  test('topological order', () => {
    const graph = new Graph([
      [9, 1],
      [9, 2],
      [2, 1],
      [4, 3],
      [5, 9]
    ]);
    expect(graph.topologicalOrder()).toStrictEqual([5, 4, 3, 9, 2, 1]);
  });
});

describe('Testing Graph queries', () => {
  test('expand outputs', () => {
    const graph = new Graph([
      [1, 2], //
      [2, 3],
      [2, 5],
      [5, 6],
      [6, 1],
      [7]
    ]);
    expect(graph.expandOutputs([])).toStrictEqual([]);
    expect(graph.expandAllOutputs([])).toStrictEqual([]);
    expect(graph.expandOutputs([3])).toStrictEqual([]);
    expect(graph.expandAllOutputs([3])).toStrictEqual([]);
    expect(graph.expandOutputs([7])).toStrictEqual([]);
    expect(graph.expandAllOutputs([7])).toStrictEqual([]);
    expect(graph.expandOutputs([2, 5])).toStrictEqual([3, 6]);
    expect(graph.expandAllOutputs([2, 5])).toStrictEqual([3, 6, 1]);
  });

  test('expand into unique array', () => {
    const graph = new Graph([
      [1, 2],
      [1, 3],
      [2, 5],
      [3, 5]
    ]);
    expect(graph.expandAllOutputs([1])).toStrictEqual([2, 3, 5]);
  });

  test('expand inputs', () => {
    const graph = new Graph([
      [1, 2], //
      [2, 3],
      [2, 5],
      [5, 6],
      [6, 1],
      [7]
    ]);
    expect(graph.expandInputs([])).toStrictEqual([]);
    expect(graph.expandAllInputs([])).toStrictEqual([]);
    expect(graph.expandInputs([7])).toStrictEqual([]);
    expect(graph.expandAllInputs([7])).toStrictEqual([]);
    expect(graph.expandInputs([6])).toStrictEqual([5]);
    expect(graph.expandAllInputs([6])).toStrictEqual([5, 2, 1]);
  });

  test('maximize part', () => {
    const graph = new Graph([
      [1, 7], //
      [1, 3],
      [2, 3],
      [2, 4],
      [3, 5],
      [3, 6],
      [3, 4],
      [7, 5],
      [8]
    ]);
    expect(graph.maximizePart([])).toStrictEqual([]);
    expect(graph.maximizePart([8])).toStrictEqual([8]);
    expect(graph.maximizePart([5])).toStrictEqual([5]);
    expect(graph.maximizePart([3])).toStrictEqual([3, 6]);
    expect(graph.maximizePart([3, 2])).toStrictEqual([3, 2, 6, 4]);
    expect(graph.maximizePart([3, 1])).toStrictEqual([3, 1, 7, 5, 6]);
  });

  test('find elementary cycle', () => {
    const graph = new Graph([
      [1, 1] //
    ]);
    expect(graph.findCycle()).toStrictEqual([1, 1]);
  });

  test('find cycle acyclic', () => {
    const graph = new Graph([
      [1, 2], //
      [2]
    ]);
    expect(graph.findCycle()).toStrictEqual(null);
  });

  test('find cycle typical', () => {
    const graph = new Graph([
      [1, 2], //
      [1, 4],
      [2, 3],
      [3, 1],
      [3, 4],
      [4]
    ]);
    expect(graph.findCycle()).toStrictEqual([1, 2, 3, 1]);
  });

  test('find cycle acyclic 2 components', () => {
    const graph = new Graph([
      [0, 1], //
      [2, 3],
      [3, 0]
    ]);
    expect(graph.findCycle()).toStrictEqual(null);
  });
});
