/**
 * Module: Custom graph data structure.
 */

/**
 * Represents single node of a {@link Graph}, as implemented by storing outgoing and incoming connections.
 */
export class GraphNode {
  id: number;
  outputs: number[];
  inputs: number[];

  constructor(id: number) {
    this.id = id;
    this.outputs = [];
    this.inputs = [];
  }

  clone(): GraphNode {
    const result = new GraphNode(this.id);
    result.outputs = [...this.outputs];
    result.inputs = [...this.inputs];
    return result;
  }

  addOutput(node: number): void {
    this.outputs.push(node);
  }

  addInput(node: number): void {
    this.inputs.push(node);
  }

  removeInput(target: number): number | null {
    const index = this.inputs.findIndex(node => node === target);
    return index > -1 ? this.inputs.splice(index, 1)[0] : null;
  }

  removeOutput(target: number): number | null {
    const index = this.outputs.findIndex(node => node === target);
    return index > -1 ? this.outputs.splice(index, 1)[0] : null;
  }
}

/**
 * Represents a Graph.
 *
 * This class is optimized for TermGraph use case and not supposed to be used as generic graph implementation.
 */
export class Graph {
  nodes = new Map<number, GraphNode>();

  constructor(arr?: number[][]) {
    if (!arr) {
      return;
    }
    arr.forEach(edge => {
      if (edge.length === 1) {
        this.addNode(edge[0]);
      } else {
        this.addEdge(edge[0], edge[1]);
      }
    });
  }

  clone(): Graph {
    const result = new Graph();
    this.nodes.forEach(node => result.nodes.set(node.id, node.clone()));
    return result;
  }

  at(target: number): GraphNode | undefined {
    return this.nodes.get(target);
  }

  addNode(target: number): GraphNode {
    let node = this.nodes.get(target);
    if (!node) {
      node = new GraphNode(target);
      this.nodes.set(target, node);
    }
    return node;
  }

  hasNode(target: number): boolean {
    return !!this.nodes.get(target);
  }

  removeNode(target: number): GraphNode | null {
    const nodeToRemove = this.nodes.get(target);
    if (!nodeToRemove) {
      return null;
    }
    this.nodes.forEach(node => {
      node.removeInput(nodeToRemove.id);
      node.removeOutput(nodeToRemove.id);
    });
    this.nodes.delete(target);
    return nodeToRemove;
  }

  foldNode(target: number): GraphNode | null {
    const nodeToRemove = this.nodes.get(target);
    if (!nodeToRemove) {
      return null;
    }
    nodeToRemove.inputs.forEach(input => {
      nodeToRemove.outputs.forEach(output => {
        this.addEdge(input, output);
      });
    });
    return this.removeNode(target);
  }

  removeIsolated(): GraphNode[] {
    const result: GraphNode[] = [];
    this.nodes.forEach(node => {
      if (node.outputs.length === 0 && node.inputs.length === 0) {
        result.push(node);
        this.nodes.delete(node.id);
      }
    });
    return result;
  }

  addEdge(source: number, destination: number): void {
    const sourceNode = this.addNode(source);
    const destinationNode = this.addNode(destination);
    sourceNode.addOutput(destinationNode.id);
    destinationNode.addInput(sourceNode.id);
  }

  removeEdge(source: number, destination: number): void {
    const sourceNode = this.nodes.get(source);
    const destinationNode = this.nodes.get(destination);
    if (sourceNode && destinationNode) {
      sourceNode.removeOutput(destination);
      destinationNode.removeInput(source);
    }
  }

  hasEdge(source: number, destination: number): boolean {
    const sourceNode = this.nodes.get(source);
    if (!sourceNode) {
      return false;
    }
    return !!sourceNode.outputs.find(id => id === destination);
  }

  expandOutputs(origin: number[]): number[] {
    const result: number[] = [];
    origin.forEach(id => {
      const node = this.nodes.get(id);
      if (node) {
        node.outputs.forEach(child => {
          if (!origin.includes(child) && !result.includes(child)) {
            result.push(child);
          }
        });
      }
    });
    return result;
  }

  expandInputs(origin: number[]): number[] {
    const result: number[] = [];
    origin.forEach(id => {
      const node = this.nodes.get(id);
      if (node) {
        node.inputs.forEach(child => {
          if (!origin.includes(child) && !result.includes(child)) {
            result.push(child);
          }
        });
      }
    });
    return result;
  }

  expandAllOutputs(origin: number[]): number[] {
    const result: number[] = this.expandOutputs(origin);
    if (result.length === 0) {
      return [];
    }

    const marked = new Map<number, boolean>();
    origin.forEach(id => marked.set(id, true));
    let position = 0;
    while (position < result.length) {
      const node = this.nodes.get(result[position]);
      if (node && !marked.get(node.id)) {
        marked.set(node.id, true);
        node.outputs.forEach(child => {
          if (!marked.get(child) && !result.find(id => id === child)) {
            result.push(child);
          }
        });
      }
      position += 1;
    }
    return result;
  }

  expandAllInputs(origin: number[]): number[] {
    const result: number[] = this.expandInputs(origin);
    if (result.length === 0) {
      return [];
    }

    const marked = new Map<number, boolean>();
    origin.forEach(id => marked.set(id, true));
    let position = 0;
    while (position < result.length) {
      const node = this.nodes.get(result[position]);
      if (node && !marked.get(node.id)) {
        marked.set(node.id, true);
        node.inputs.forEach(child => {
          if (!marked.get(child) && !result.find(id => id === child)) {
            result.push(child);
          }
        });
      }
      position += 1;
    }
    return result;
  }

  maximizePart(origin: number[]): number[] {
    const outputs: number[] = this.expandAllOutputs(origin);
    const result = [...origin];
    this.topologicalOrder()
      .filter(id => outputs.includes(id))
      .forEach(id => {
        const node = this.nodes.get(id);
        if (node?.inputs.every(parent => result.includes(parent))) {
          result.push(id);
        }
      });
    return result;
  }

  topologicalOrder(): number[] {
    const result: number[] = [];
    const marked = new Set<number>();
    const nodeStack: number[] = [];
    this.nodes.forEach(node => {
      if (marked.has(node.id)) {
        return;
      }
      nodeStack.push(node.id);
      while (nodeStack.length > 0) {
        const item = nodeStack[nodeStack.length - 1];
        if (marked.has(item)) {
          if (!result.find(id => id === item)) {
            result.push(item);
          }
          nodeStack.pop();
        } else {
          marked.add(item);
          const itemNode = this.nodes.get(item);
          if (itemNode && itemNode.outputs.length > 0) {
            itemNode.outputs.forEach(child => {
              if (!marked.has(child)) {
                nodeStack.push(child);
              }
            });
          }
        }
      }
    });
    return result.reverse();
  }

  transitiveReduction() {
    const order = this.topologicalOrder();
    const marked = new Map<number, boolean>();
    order.forEach(nodeID => {
      if (marked.get(nodeID)) {
        return;
      }
      const stack: { id: number; parents: number[] }[] = [];
      stack.push({ id: nodeID, parents: [] });
      while (stack.length > 0) {
        const item = stack.splice(0, 1)[0];
        const node = this.nodes.get(item.id);
        if (node) {
          node.outputs.forEach(child => {
            item.parents.forEach(parent => this.removeEdge(parent, child));
            stack.push({ id: child, parents: [item.id, ...item.parents] });
          });
        }
        marked.set(item.id, true);
      }
    });
  }

  /**
   * Finds a cycle in the graph.
   *
   * @returns {number[] | null} The cycle if found, otherwise `null`.
   * Uses non-recursive DFS.
   */
  findCycle(): number[] | null {
    const visited = new Set<number>();
    const nodeStack = new Set<number>();
    const parents = new Map<number, number>();

    for (const nodeId of this.nodes.keys()) {
      if (visited.has(nodeId)) {
        continue;
      }

      const callStack: { nodeId: number; parentId: number | null }[] = [];
      callStack.push({ nodeId: nodeId, parentId: null });
      while (callStack.length > 0) {
        const { nodeId, parentId } = callStack[callStack.length - 1];
        if (visited.has(nodeId)) {
          nodeStack.delete(nodeId);
          callStack.pop();
          continue;
        }
        visited.add(nodeId);
        nodeStack.add(nodeId);
        if (parentId !== null) {
          parents.set(nodeId, parentId);
        }

        const currentNode = this.nodes.get(nodeId)!;
        for (const child of currentNode.outputs) {
          if (!visited.has(child)) {
            callStack.push({ nodeId: child, parentId: nodeId });
            continue;
          }
          if (!nodeStack.has(child)) {
            continue;
          }
          const cycle: number[] = [];
          let current = nodeId;
          cycle.push(child);
          while (current !== child) {
            cycle.push(current);
            current = parents.get(current)!;
          }
          cycle.push(child);
          cycle.reverse();
          return cycle;
        }
      }
    }
    return null;
  }
}
