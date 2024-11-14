import { Node } from 'reactflow';

import { Graph } from '@/models/Graph';
import { TMGraphNode } from '@/models/TMGraph';

export function applyLayout(nodes: Node<TMGraphNode>[]) {
  new LayoutManager(nodes).execute();
}

const UNIT_HEIGHT = 100;
const UNIT_WIDTH = 100;
const MIN_NODE_DISTANCE = 80;
const LAYOUT_ITERATIONS = 8;

class LayoutManager {
  nodes: Node<TMGraphNode>[];

  graph = new Graph();
  ranks = new Map<number, number>();
  posX = new Map<number, number>();
  posY = new Map<number, number>();

  maxRank = 0;
  virtualCount = 0;
  layers: number[][] = [];

  constructor(nodes: Node<TMGraphNode>[]) {
    this.nodes = nodes;
    this.prepareGraph();
  }

  /** Prepares graph for layout calculations.
   *
   * Assumes that nodes are already topologically sorted.
   * 1. Adds nodes to graph.
   * 2. Adds elementary edges to graph.
   * 3. Splits non-elementary edges via virtual nodes.
   */
  private prepareGraph(): void {
    this.nodes.forEach(node => {
      if (this.maxRank < node.data.rank) {
        this.maxRank = node.data.rank;
      }
      const nodeID = node.data.id;
      this.ranks.set(nodeID, node.data.rank);
      this.graph.addNode(nodeID);
      if (node.data.parents.length === 0) {
        return;
      }

      const visited = new Set<number>();
      node.data.parents.forEach(parent => {
        if (!visited.has(parent)) {
          visited.add(parent);
          let target = nodeID;
          let currentRank = node.data.rank;
          const parentRank = this.ranks.get(parent)!;
          while (currentRank - 1 > parentRank) {
            currentRank = currentRank - 1;

            this.virtualCount = this.virtualCount + 1;
            this.ranks.set(-this.virtualCount, currentRank);
            this.graph.addEdge(-this.virtualCount, target);
            target = -this.virtualCount;
          }
          this.graph.addEdge(parent, target);
        }
      });
    });
  }

  execute(): void {
    this.calculateLayers();
    this.calculatePositions();
    this.savePositions();
  }

  private calculateLayers(): void {
    this.initLayers();
    // TODO: implement ordering algorithm iterations
  }

  private initLayers(): void {
    this.layers = Array.from({ length: this.maxRank + 1 }, () => []);

    const visited = new Set<number>();
    const dfs = (nodeID: number) => {
      if (visited.has(nodeID)) {
        return;
      }
      visited.add(nodeID);
      this.layers[this.ranks.get(nodeID)!].push(nodeID);
      this.graph.at(nodeID)!.outputs.forEach(dfs);
    };

    const simpleNodes = this.nodes
      .filter(node => node.data.rank === 0)
      .sort((a, b) => a.data.text.localeCompare(b.data.text))
      .map(node => node.data.id);

    simpleNodes.forEach(dfs);
  }

  private calculatePositions(): void {
    this.initPositions();

    for (let i = 0; i < LAYOUT_ITERATIONS; i++) {
      this.fixLayersPositions();
    }
  }

  private fixLayersPositions(): void {
    for (let rank = 1; rank <= this.maxRank; rank++) {
      this.layers[rank].reverse().forEach(nodeID => {
        const inputs = this.graph.at(nodeID)!.inputs;
        const currentPos = this.posX.get(nodeID)!;
        if (inputs.length === 1) {
          const parent = inputs[0];
          const parentPos = this.posX.get(parent)!;
          if (currentPos === parentPos) {
            return;
          }
          if (currentPos > parentPos) {
            this.tryMoveNodeX(parent, currentPos);
          } else {
            this.tryMoveNodeX(nodeID, parentPos);
          }
        } else if (inputs.length % 2 === 1) {
          const median = inputs[Math.floor(inputs.length / 2)];
          const medianPos = this.posX.get(median)!;
          if (currentPos === medianPos) {
            return;
          }
          this.tryMoveNodeX(nodeID, medianPos);
        } else {
          const median1 = inputs[Math.floor(inputs.length / 2)];
          const median2 = inputs[Math.floor(inputs.length / 2) - 1];
          const medianPos = (this.posX.get(median1)! + this.posX.get(median2)!) / 2;
          this.tryMoveNodeX(nodeID, medianPos);
        }
      });
    }
  }

  private tryMoveNodeX(nodeID: number, targetX: number) {
    const rank = this.ranks.get(nodeID)!;
    if (this.layers[rank].some(id => id !== nodeID && Math.abs(targetX - this.posX.get(id)!) < MIN_NODE_DISTANCE)) {
      return;
    }
    this.posX.set(nodeID, targetX);
  }

  private initPositions(): void {
    this.layers.forEach((layer, rank) => {
      layer.forEach((nodeID, index) => {
        this.posX.set(nodeID, index * UNIT_WIDTH);
        this.posY.set(nodeID, -rank * UNIT_HEIGHT);
      });
    });
  }

  private savePositions(): void {
    this.nodes.forEach(node => {
      const nodeID = node.data.id;
      node.position = {
        x: this.posX.get(nodeID)!,
        y: this.posY.get(nodeID)!
      };
    });
  }
}
