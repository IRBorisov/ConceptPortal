// Graph class with basic comparison. Does not work for objects
export class GraphNode {
  id: number;
  adjacent: number[];

  constructor(id: number) {
    this.id = id;
    this.adjacent = [];
  }

  addAdjacent(node: number): void {
    this.adjacent.push(node);
  }

  removeAdjacent(target: number): number | null {
    const index = this.adjacent.findIndex(node => node === target);
    if (index > -1) {
      return this.adjacent.splice(index, 1)[0];
    }
    return null;
  }
}

export class Graph {
  nodes: Map<number, GraphNode> = new Map();

  constructor() {}

  addNode(target: number): GraphNode {
    let node = this.nodes.get(target);
    if (!node) {
      node = new GraphNode(target);
      this.nodes.set(target, node);
    }
    return node;
  }

  removeNode(target: number): GraphNode | null {
    const nodeToRemove = this.nodes.get(target);
    if (!nodeToRemove) {
      return null;
    }
    this.nodes.forEach((node) => {
      node.removeAdjacent(nodeToRemove.id);
    });
    this.nodes.delete(target);
    return nodeToRemove;
  }

  addEdge(source: number, destination: number): void {
    const sourceNode = this.addNode(source);
    const destinationNode = this.addNode(destination);
    sourceNode.addAdjacent(destinationNode.id);
  }

  removeEdge(source: number, destination: number): void {
    const sourceNode = this.nodes.get(source);
    const destinationNode = this.nodes.get(destination);
    if (sourceNode && destinationNode) {
      sourceNode.removeAdjacent(destination);
    }
  }

  visitDFS(visitor: (node: GraphNode) => void) {
    const visited: Map<number, boolean> = new Map();
    this.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        this.depthFirstSearchAux(node, visited, visitor);
      }
    });
  }

  private depthFirstSearchAux(node: GraphNode, visited: Map<number, boolean>, visitor: (node: GraphNode) => void): void {
    if (!node) {
      return;
    }
    visited.set(node.id, true);

    visitor(node);

    node.adjacent.forEach((item) => {
      if (!visited.has(item)) {
        const childNode = this.nodes.get(item);
        if (childNode) this.depthFirstSearchAux(childNode, visited, visitor);
      }
    });
  }
}
