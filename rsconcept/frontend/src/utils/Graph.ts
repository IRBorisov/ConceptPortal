// ======== ID based fast Graph implementation =============
export class GraphNode {
  id: number;
  outputs: number[];
  inputs: number[];

  constructor(id: number) {
    this.id = id;
    this.outputs = [];
    this.inputs = [];
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

export class Graph {
  nodes: Map<number, GraphNode> = new Map();

  constructor(arr?: number[][]) {
    if (!arr) {
      return;
    }
    arr.forEach(edge => {
      if (edge.length == 1) {
        this.addNode(edge[0]);
      } else {
        this.addEdge(edge[0], edge[1]);
      }
    });
  }

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
    this.nodes.forEach(node => {
      node.removeInput(nodeToRemove.id);
      node.removeOutput(nodeToRemove.id);
    });
    this.nodes.delete(target);
    return nodeToRemove;
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

  expandOutputs(origin: number[]): number[] {
    const result: number[] = [];
    const marked = new Map<number, boolean>();
    origin.forEach(id => marked.set(id, true));
    origin.forEach(id => {
      const node = this.nodes.get(id);
      if (node) {
        node.outputs.forEach(child => {
          if (!marked.get(child) && !result.find(id => id === child)) {
            result.push(child);
          }
        });
      }
    });
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
  
  expandInputs(origin: number[]): number[] {
    const result: number[] = [];
    const marked = new Map<number, boolean>();
    origin.forEach(id => marked.set(id, true));
    origin.forEach(id => {
      const node = this.nodes.get(id);
      if (node) {
        node.inputs.forEach(child => {
          if (!marked.get(child) && !result.find(id => id === child)) {
            result.push(child);
          }
        });
      }
    });
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

  visitDFS(visitor: (node: GraphNode) => void) {
    const visited: Map<number, boolean> = new Map();
    this.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        this.depthFirstSearch(node, visited, visitor);
      }
    });
  }

  private depthFirstSearch(
    node: GraphNode,
    visited: Map<number, boolean>,
    visitor: (node: GraphNode) => void)
  : void {
    visited.set(node.id, true);
    visitor(node);
    node.outputs.forEach((item) => {
      if (!visited.has(item)) {
        const childNode = this.nodes.get(item)!;
        this.depthFirstSearch(childNode, visited, visitor);
      }
    });
  }
}
