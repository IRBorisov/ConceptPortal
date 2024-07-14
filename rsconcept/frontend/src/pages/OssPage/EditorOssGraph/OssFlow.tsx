'use client';

import { useMemo } from 'react';
import { NodeTypes, ProOptions, ReactFlow } from 'reactflow';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { useOSS } from '@/context/OssContext';

import { IOssEditContext } from '../OssEditContext';
import InputNode from './InputNode';
import OperationNode from './OperationNode';

const OssNodeTypes: NodeTypes = {
  synthesis: OperationNode,
  input: InputNode
};

interface OssFlowProps {
  controller: IOssEditContext;
}

function OssFlow({ controller }: OssFlowProps) {
  const { calculateHeight } = useConceptOptions();
  const model = useOSS();

  console.log(model.loading);
  console.log(controller.isMutable);

  const initialNodes = [
    { id: '1', position: { x: 0, y: 0 }, data: { label: '1' }, type: 'input' },
    { id: '2', position: { x: 0, y: 100 }, data: { label: '2' }, type: 'synthesis' }
  ];
  const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

  const proOptions: ProOptions = { hideAttribution: true };

  const canvasWidth = useMemo(() => {
    return 'calc(100vw - 1rem)';
  }, []);

  const canvasHeight = useMemo(() => calculateHeight('1.75rem + 4px'), [calculateHeight]);

  return (
    <div className='relative' style={{ height: canvasHeight, width: canvasWidth }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} fitView proOptions={proOptions} nodeTypes={OssNodeTypes} />
    </div>
  );
}

export default OssFlow;
