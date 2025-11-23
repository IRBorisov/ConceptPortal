'use client';

import { createContext, use } from 'react';
import { type Edge, type EdgeChange, type NodeChange } from '@xyflow/react';

import { type OGNode } from './graph/og-models';

interface IOssFlowContext {
  containMovement: boolean;
  setContainMovement: React.Dispatch<React.SetStateAction<boolean>>;

  nodes: OGNode[];
  setNodes: React.Dispatch<React.SetStateAction<OGNode[]>>;
  onNodesChange: (changes: NodeChange<OGNode>[]) => void;
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
