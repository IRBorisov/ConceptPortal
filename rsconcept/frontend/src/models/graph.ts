/**
 * Module: Custom graph data structure.
 */

/**
 * Represents single node of a {@link Graph}, as implemented by storing outgoing and incoming connections.
 */
export class GraphNode<NodeID> {
  /** Unique identifier of the node. */
  id: NodeID;
  /** List of outgoing nodes. */
  outputs: NodeID[];
  /** List of incoming nodes. */
  inputs: NodeID[];

  constructor(id: NodeID) {
    this.id = id;
    this.outputs = [];
    this.inputs = [];
  }

  clone(): GraphNode<NodeID> {
    const result = new GraphNode(this.id);
    result.outputs = [...this.outputs];
    result.inputs = [...this.inputs];
    return result;
  }

  addOutput(node: NodeID): void {
    this.outputs.push(node);
  }

  addInput(node: NodeID): void {
    this.inputs.push(node);
  }

  removeInput(target: NodeID): NodeID | null {
    const index = this.inputs.findIndex(node => node === target);
    return index > -1 ? this.inputs.splice(index, 1)[0] : null;
  }

  removeOutput(target: NodeID): NodeID | null {
    const index = this.outputs.findIndex(node => node === target);
    return index > -1 ? this.outputs.splice(index, 1)[0] : null;
  }
}

/**
 * Represents a Graph.
 *
 * This class is optimized for TermGraph use case and not supposed to be used as generic graph implementation.
 */
export class Graph<NodeID = number> {
  /** Map of nodes. */
  nodes = new Map<NodeID, GraphNode<NodeID>>();

  constructor(arr?: NodeID[][]) {
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

  clone(): Graph<NodeID> {
    const result = new Graph<NodeID>();
    this.nodes.forEach(node => result.nodes.set(node.id, node.clone()));
    return result;
  }

  at(target: NodeID): GraphNode<NodeID> | undefined {
    return this.nodes.get(target);
  }

  addNode(target: NodeID): GraphNode<NodeID> {
    let node = this.nodes.get(target);
    if (!node) {
      node = new GraphNode(target);
      this.nodes.set(target, node);
    }
    return node;
  }

  hasNode(target: NodeID): boolean {
    return !!this.nodes.get(target);
  }

  removeNode(target: NodeID): void {
    this.nodes.forEach(node => {
      node.removeInput(target);
      node.removeOutput(target);
    });
    this.nodes.delete(target);
  }

  foldNode(target: NodeID): void {
    const nodeToRemove = this.nodes.get(target);
    if (!nodeToRemove) {
      return;
    }
    nodeToRemove.inputs.forEach(input => {
      nodeToRemove.outputs.forEach(output => {
        this.addEdge(input, output);
      });
    });
    this.removeNode(target);
  }

  removeIsolated(): GraphNode<NodeID>[] {
    const result: GraphNode<NodeID>[] = [];
    this.nodes.forEach(node => {
      if (node.outputs.length === 0 && node.inputs.length === 0) {
        result.push(node);
        this.nodes.delete(node.id);
      }
    });
    return result;
  }

  addEdge(source: NodeID, destination: NodeID): void {
    if (this.hasEdge(source, destination)) {
      return;
    }
    const sourceNode = this.addNode(source);
    const destinationNode = this.addNode(destination);
    sourceNode.addOutput(destinationNode.id);
    destinationNode.addInput(sourceNode.id);
  }

  removeEdge(source: NodeID, destination: NodeID): void {
    const sourceNode = this.nodes.get(source);
    const destinationNode = this.nodes.get(destination);
    if (sourceNode && destinationNode) {
      sourceNode.removeOutput(destination);
      destinationNode.removeInput(source);
    }
  }

  hasEdge(source: NodeID, destination: NodeID): boolean {
    const sourceNode = this.nodes.get(source);
    if (!sourceNode) {
      return false;
    }
    return !!sourceNode.outputs.find(id => id === destination);
  }

  isReachable(source: NodeID, destination: NodeID): boolean {
    return this.expandAllOutputs([source]).includes(destination);
  }

  rootNodes(): NodeID[] {
    return [...this.nodes.keys()].filter(id => !this.nodes.get(id)?.inputs.length);
  }

  expandOutputs(origin: NodeID[]): NodeID[] {
    const result: NodeID[] = [];
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

  expandInputs(origin: NodeID[]): NodeID[] {
    const result: NodeID[] = [];
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

  expandAllOutputs(origin: NodeID[]): NodeID[] {
    const result: NodeID[] = this.expandOutputs(origin);
    if (result.length === 0) {
      return [];
    }

    const marked = new Map<NodeID, boolean>();
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

  expandAllInputs(origin: NodeID[]): NodeID[] {
    const result: NodeID[] = this.expandInputs(origin);
    if (result.length === 0) {
      return [];
    }

    const marked = new Map<NodeID, boolean>();
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

  maximizePart(origin: NodeID[]): NodeID[] {
    const outputs: NodeID[] = this.expandAllOutputs(origin);
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

  topologicalOrder(): NodeID[] {
    const result: NodeID[] = [];
    const marked = new Set<NodeID>();
    const nodeStack: NodeID[] = [];
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
    const marked = new Map<NodeID, boolean>();
    order.forEach(nodeID => {
      if (marked.get(nodeID)) {
        return;
      }
      const stack: { id: NodeID; parents: NodeID[] }[] = [];
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
   * @returns {NodeID[] | null} The cycle if found, otherwise `null`.
   * Uses non-recursive DFS.
   */
  findCycle(): NodeID[] | null {
    const visited = new Set<NodeID>();
    const nodeStack = new Set<NodeID>();
    const parents = new Map<NodeID, NodeID>();

    for (const nodeId of this.nodes.keys()) {
      if (visited.has(nodeId)) {
        continue;
      }

      const callStack: { nodeId: NodeID; parentId: NodeID | null }[] = [];
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
          const cycle: NodeID[] = [];
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
