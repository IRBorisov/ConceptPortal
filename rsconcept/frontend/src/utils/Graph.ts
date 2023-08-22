// ======== ID based fast Graph implementation =============
export class GraphNode {
  id: string;
  outputs: string[];
  inputs: string[];

  constructor(id: string) {
    this.id = id;
    this.outputs = [];
    this.inputs = [];
  }

  clone(): GraphNode {
    const result = new GraphNode(this.id);
    result.outputs = [... this.outputs];
    result.inputs = [... this.inputs];
    return result;
  }

  addOutput(node: string): void {
    this.outputs.push(node);
  }

  addInput(node: string): void {
    this.inputs.push(node);
  }

  removeInput(target: string): string | null {
    const index = this.inputs.findIndex(node => node === target);
    return index > -1 ? this.inputs.splice(index, 1)[0] : null;
  }

  removeOutput(target: string): string | null {
    const index = this.outputs.findIndex(node => node === target);
    return index > -1 ? this.outputs.splice(index, 1)[0] : null;
  }
}

export class Graph {
  nodes: Map<string, GraphNode> = new Map();

  constructor(arr?: string[][]) {
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

  addNode(target: string): GraphNode {
    let node = this.nodes.get(target);
    if (!node) {
      node = new GraphNode(target);
      this.nodes.set(target, node);
    }
    return node;
  }

  hasNode(target: string): boolean {
    return !!this.nodes.get(target);
  }

  removeNode(target: string): GraphNode | null {
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

  foldNode(target: string): GraphNode | null {
    const nodeToRemove = this.nodes.get(target);
    if (!nodeToRemove) {
      return null;
    }
    nodeToRemove.inputs.forEach(input => {
      nodeToRemove.outputs.forEach(output => {
        this.addEdge(input, output);
      })
    });
    return this.removeNode(target);
  }

  removeIsolated(): GraphNode[] {
    const result: GraphNode[] = [];
    this.nodes.forEach(node => {
      if (node.outputs.length === 0 && node.inputs.length === 0) {
        this.nodes.delete(node.id);
      }
    });
    return result;
  }

  addEdge(source: string, destination: string): void {
    const sourceNode = this.addNode(source);
    const destinationNode = this.addNode(destination);
    sourceNode.addOutput(destinationNode.id);
    destinationNode.addInput(sourceNode.id);
  }

  removeEdge(source: string, destination: string): void {
    const sourceNode = this.nodes.get(source);
    const destinationNode = this.nodes.get(destination);
    if (sourceNode && destinationNode) {
      sourceNode.removeOutput(destination);
      destinationNode.removeInput(source);
    }
  }

  hasEdge(source: string, destination: string): boolean {
    const sourceNode = this.nodes.get(source);
    if (!sourceNode) {
      return false;
    }
    return !!sourceNode.outputs.find(id => id === destination);
  }

  expandOutputs(origin: string[]): string[] {
    const result: string[] = [];
    const marked = new Map<string, boolean>();
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
  
  expandInputs(origin: string[]): string[] {
    const result: string[] = [];
    const marked = new Map<string, boolean>();
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

  tolopogicalOrder(): string[] {
    const result: string[] = [];
    const marked = new Map<string, boolean>();
    const toVisit: string[] = [];
    this.nodes.forEach(node => {
      if (marked.get(node.id)) {
        return;
      }
      toVisit.push(node.id)
      while (toVisit.length > 0) {
        const item = toVisit[toVisit.length - 1];
        if (marked.get(item)) {
          if (!result.find(id => id === item)) {
            result.push(item);
          } 
          toVisit.pop();
        } else {
          marked.set(item, true);
          const itemNode = this.nodes.get(item);
          if (itemNode && itemNode.outputs.length > 0) {
            itemNode.outputs.forEach(child => {
              if (!marked.get(child)) {
                toVisit.push(child);
              }
            });
          }
        }
      }
    });
    return result.reverse();
  }

  transitiveReduction() {
    const order = this.tolopogicalOrder();
    const marked = new Map<string, boolean>();
    order.forEach(nodeID => {
      if (marked.get(nodeID)) {
        return;
      }
      const stack: {id: string, parents: string[]}[] = [];
      stack.push({id: nodeID, parents: []});
      while (stack.length > 0) {
        const item = stack.splice(0, 1)[0];
        const node = this.nodes.get(item.id);
        if (node) {
          node.outputs.forEach(child => {
            item.parents.forEach(parent => this.removeEdge(parent, child));
            stack.push({id: child, parents: [item.id, ...item.parents]})
          });
        }
        marked.set(item.id, true)
      }
    });
  } 
}
