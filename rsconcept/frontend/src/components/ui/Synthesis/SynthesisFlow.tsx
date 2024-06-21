import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node, OnSelectionChangeParams
} from '@reactflow/core';


import OperationNode from './OperationNode';
import InputNode from './InputNode';

// this is important! You need to import the styles from the lib to make it work
import '@reactflow/core/dist/style.css';

import './SynthesisFlow.css';
import { useState } from 'react';
import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';
import { useConceptOptions } from '@/context/OptionsContext.tsx';


const nodeTypes = {
  custom: OperationNode,
  input: InputNode
};

function Flow() {
  const controller = useSynthesis();
  const { calculateHeight, darkMode } = useConceptOptions();
  const canvasWidth = useMemo(() => {
    return 'calc(100vw - 1rem)';
  }, []);

  const canvasHeight = useMemo(() => calculateHeight('1.75rem + 4px'), [calculateHeight]);
  return (
    <div className="relative" style={{ height: canvasHeight, width: canvasWidth }}>
      <ReactFlow
        nodes={controller.getNodes()}
        onNodesChange={controller.onNodesChange}
        onNodesDelete={controller.onNodesDelete}
        edges={controller.getEdges()}
        onEdgesChange={controller.onEdgesChange}
        onConnect={controller.onConnect}
        fitView
        nodeTypes={nodeTypes}
      />
    </div>
  );
}

export default Flow;
