'use client';

import { Handle, Position } from 'reactflow';

import { type OperationInternalNode } from '../../../../models/oss-layout';

import { NodeCore } from './node-core';

export function SynthesisNode(node: OperationInternalNode) {
  return (
    <>
      <Handle type='target' position={Position.Top} id='left' style={{ left: 40, top: -2 }} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto', top: -2 }} />
      <NodeCore node={node} />
      <Handle type='source' position={Position.Bottom} className='-translate-y-[1px]' />
    </>
  );
}
