import { describe, expect, it } from 'vitest';

import { Graph } from './graph';

describe('Testing Graph construction', () => {
  it('empty Graph should be empty', () => {
    const graph = new Graph();
    expect(graph.nodes.size).toBe(0);
  });

  it('adding edges should create nodes', () => {
    const graph = new Graph();
    graph.addEdge(13, 37);
    expect([...graph.nodes.keys()]).toStrictEqual([13, 37]);

    graph.addEdge(13, 38);
    expect([...graph.nodes.keys()]).toStrictEqual([13, 37, 38]);
  });

  it('creating from array', () => {
    const graph = new Graph([[1, 2], [3], [4, 1]]);
    expect([...graph.nodes.keys()]).toStrictEqual([1, 2, 3, 4]);
    expect([...graph.nodes.get(1)!.outputs]).toStrictEqual([2]);
  });

  it('cloning', () => {
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
  it('removing edges should not remove nodes', () => {
    const graph = new Graph([[1, 2], [3], [4, 1]]);
    expect(graph.hasEdge(4, 1)).toBeTruthy();

    graph.removeEdge(5, 0);
    graph.removeEdge(4, 1);

    expect([...graph.nodes.keys()]).toStrictEqual([1, 2, 3, 4]);
    expect(graph.hasEdge(4, 1)).toBeFalsy();
  });

  it('folding node redirects edges', () => {
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

  it('folding a non-existent node should not change the graph', () => {
    const graph = new Graph([
      [1, 2],
      [2, 3]
    ]);
    const clone = graph.clone();
    graph.foldNode(99); // Node 99 does not exist
    expect(graph.nodes.size).toBe(clone.nodes.size);
    expect([...graph.nodes.keys()]).toEqual([...clone.nodes.keys()]);
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(2, 3)).toBeTruthy();
  });

  it('folding a node with no inputs', () => {
    const graph = new Graph([
      [1, 2],
      [1, 3]
    ]);
    graph.foldNode(1);
    expect(graph.hasNode(1)).toBeFalsy();
    expect(graph.nodes.size).toBe(2); // Nodes 2 and 3 remain
    expect(graph.hasNode(2)).toBeTruthy();
    expect(graph.hasNode(3)).toBeTruthy();
  });

  it('folding a node with no outputs', () => {
    const graph = new Graph([
      [1, 3],
      [2, 3]
    ]);
    graph.foldNode(3);
    expect(graph.hasNode(3)).toBeFalsy();
    expect(graph.nodes.size).toBe(2); // Nodes 1 and 2 remain
    expect(graph.hasNode(1)).toBeTruthy();
    expect(graph.hasNode(2)).toBeTruthy();
    expect(graph.nodes.get(1)!.outputs.length).toBe(0);
    expect(graph.nodes.get(2)!.outputs.length).toBe(0);
  });

  it('removing isolated nodes', () => {
    const graph = new Graph([[9, 1], [9, 2], [2, 1], [4, 3], [5, 9], [7], [8]]);
    graph.removeIsolated();
    expect([...graph.nodes.keys()]).toStrictEqual([9, 1, 2, 4, 3, 5]);
  });

  it('transitive reduction', () => {
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

  it('transitive reduction - empty graph', () => {
    const graph = new Graph();
    expect(() => graph.transitiveReduction()).not.toThrow();
    expect(graph.nodes.size).toBe(0);
  });

  it('transitive reduction - single node', () => {
    const graph = new Graph([[1]]);
    graph.transitiveReduction();
    expect(graph.hasNode(1)).toBeTruthy();
    expect(graph.nodes.get(1)!.outputs.length).toBe(0);
    expect(graph.nodes.get(1)!.inputs.length).toBe(0);
  });

  it('transitive reduction - linear chain', () => {
    const graph = new Graph([
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5]
    ]);
    graph.transitiveReduction();
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(2, 3)).toBeTruthy();
    expect(graph.hasEdge(3, 4)).toBeTruthy();
    expect(graph.hasEdge(4, 5)).toBeTruthy();
    expect(graph.hasEdge(1, 3)).toBeFalsy();
    expect(graph.hasEdge(1, 4)).toBeFalsy();
    expect(graph.hasEdge(1, 5)).toBeFalsy();
    expect(graph.hasEdge(2, 4)).toBeFalsy();
    expect(graph.hasEdge(2, 5)).toBeFalsy();
    expect(graph.hasEdge(3, 5)).toBeFalsy();
  });

  it('transitive reduction - diamond pattern', () => {
    const graph = new Graph([
      [1, 2],
      [1, 3],
      [2, 4],
      [3, 4]
    ]);
    graph.transitiveReduction();
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(1, 3)).toBeTruthy();
    expect(graph.hasEdge(2, 4)).toBeTruthy();
    expect(graph.hasEdge(3, 4)).toBeTruthy();
    expect(graph.hasEdge(1, 4)).toBeFalsy();
  });

  it('transitive reduction - complex transitive relationships', () => {
    const graph = new Graph([
      [6, 7],
      [5, 7],
      [4, 6],
      [3, 5],
      [2, 5],
      [1, 4],
      [1, 3],
      [1, 2]
    ]);
    graph.transitiveReduction();
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(1, 3)).toBeTruthy();
    expect(graph.hasEdge(1, 4)).toBeTruthy();
    expect(graph.hasEdge(2, 5)).toBeTruthy();
    expect(graph.hasEdge(3, 5)).toBeTruthy();
    expect(graph.hasEdge(4, 6)).toBeTruthy();
    expect(graph.hasEdge(5, 7)).toBeTruthy();
    expect(graph.hasEdge(6, 7)).toBeTruthy();

    expect(graph.hasEdge(1, 5)).toBeFalsy();
    expect(graph.hasEdge(1, 7)).toBeFalsy();
    expect(graph.hasEdge(2, 7)).toBeFalsy();
    expect(graph.hasEdge(3, 7)).toBeFalsy();
    expect(graph.hasEdge(4, 7)).toBeFalsy();
  });

  it('transitive reduction - disconnected components', () => {
    const graph = new Graph([
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [4, 6] // This should be removed
    ]);
    graph.transitiveReduction();
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(2, 3)).toBeTruthy();
    expect(graph.hasEdge(4, 5)).toBeTruthy();
    expect(graph.hasEdge(5, 6)).toBeTruthy();
    expect(graph.hasEdge(4, 6)).toBeFalsy();
  });

  it('transitive reduction - multiple paths same length', () => {
    const graph = new Graph([
      [3, 4],
      [2, 4],
      [1, 3],
      [1, 2]
    ]);
    graph.transitiveReduction();
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(1, 3)).toBeTruthy();
    expect(graph.hasEdge(2, 4)).toBeTruthy();
    expect(graph.hasEdge(3, 4)).toBeTruthy();
  });

  it('transitive reduction - already reduced graph', () => {
    const graph = new Graph([
      [1, 2],
      [2, 3]
    ]);
    const originalEdgeCount = 2;
    graph.transitiveReduction();
    expect(graph.hasEdge(1, 2)).toBeTruthy();
    expect(graph.hasEdge(2, 3)).toBeTruthy();
    expect(graph.hasEdge(1, 3)).toBeFalsy();
    // Should still have 2 edges
    let edgeCount = 0;
    graph.nodes.forEach(node => (edgeCount += node.outputs.length));
    expect(edgeCount).toBe(originalEdgeCount);
  });

  it('transitive reduction - preserves all nodes', () => {
    const graph = new Graph([
      [1, 2],
      [1, 3],
      [2, 3]
    ]);
    const originalNodeCount = graph.nodes.size;
    graph.transitiveReduction();
    expect(graph.nodes.size).toBe(originalNodeCount);
    expect(graph.hasNode(1)).toBeTruthy();
    expect(graph.hasNode(2)).toBeTruthy();
    expect(graph.hasNode(3)).toBeTruthy();
  });
});

describe('Testing Graph sort', () => {
  it('topological order', () => {
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
  it('expand outputs', () => {
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

  it('expand into unique array', () => {
    const graph = new Graph([
      [1, 2],
      [1, 3],
      [2, 5],
      [3, 5]
    ]);
    expect(graph.expandAllOutputs([1])).toStrictEqual([2, 3, 5]);
  });

  it('expand inputs', () => {
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

  it('maximize part', () => {
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

  it('find elementary cycle', () => {
    const graph = new Graph([
      [1, 1] //
    ]);
    expect(graph.findCycle()).toStrictEqual([1, 1]);
  });

  it('find cycle acyclic', () => {
    const graph = new Graph([
      [1, 2], //
      [2]
    ]);
    expect(graph.findCycle()).toStrictEqual(null);
  });

  it('find cycle typical', () => {
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

  it('find cycle acyclic 2 components', () => {
    const graph = new Graph([
      [0, 1], //
      [2, 3],
      [3, 0]
    ]);
    expect(graph.findCycle()).toStrictEqual(null);
  });
});
