'use client';

import { Handle, Position } from 'reactflow';

import { OssNodeInternal } from '@/models/miscellaneous';

import NodeCore from './NodeCore';

function OperationNode(node: OssNodeInternal) {
  return (
    <>
      <Handle type='target' position={Position.Top} id='left' style={{ left: 40 }} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto' }} />
      <NodeCore node={node} />
      <Handle type='source' position={Position.Bottom} />
    </>
  );
}

export default OperationNode;