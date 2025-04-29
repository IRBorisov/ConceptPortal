'use client';

import { createContext, use } from 'react';
import { type Edge, type EdgeChange, type Node, type NodeChange } from 'reactflow';

interface IOssFlowContext {
  containMovement: boolean;
  setContainMovement: React.Dispatch<React.SetStateAction<boolean>>;

  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onEdgesChange: (changes: EdgeChange[]) => void;
  resetGraph: () => void;
  resetView: () => void;
}

export const OssFlowContext = createContext<IOssFlowContext | null>(null);
export const useOssFlow = () => {
  const context = use(OssFlowContext);
  if (context === null) {
    throw new Error('useOssFlow has to be used within <OssFlowState>');
  }
  return context;
};
