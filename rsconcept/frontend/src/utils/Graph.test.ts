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
});