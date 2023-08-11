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

  clone(): GraphNode {
    const result = new GraphNode(this.id);
    result.outputs = [... this.outputs];
    result.inputs = [... this.inputs];
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

  clone(): Graph {
    const result = new Graph();
    this.nodes.forEach(node => result.nodes.set(node.id, node.clone()));
    return result;
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

  removeIsolated(): GraphNode[] {
    const result: GraphNode[] = [];
    this.nodes.forEach(node => {
      if (node.outputs.length === 0 && node.inputs.length === 0) {
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

  tolopogicalOrder(): number[] {
    const result: number[] = [];
    const marked = new Map<number, boolean>();
    this.nodes.forEach(node => {
      if (marked.get(node.id)) {
        return;
      }
      const toVisit: number[] = [node.id];
      let index = 0;
      while (toVisit.length > 0) {
        const item = toVisit[index];
        if (marked.get(item)) {
          if (!result.find(id => id ===item)) {
            result.push(item);
          } 
          toVisit.splice(index, 1);
          index -= 1;
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
          if (index + 1 < toVisit.length) {
            index += 1;
          }
        }
      }
      marked
    });
    return result.reverse();
  }

  transitiveReduction() {
    const order = this.tolopogicalOrder();
    const marked = new Map<number, boolean>();
    order.forEach(nodeID => {
      if (marked.get(nodeID)) {
        return;
      }
      const stack: {id: number, parents: number[]}[] = [];
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