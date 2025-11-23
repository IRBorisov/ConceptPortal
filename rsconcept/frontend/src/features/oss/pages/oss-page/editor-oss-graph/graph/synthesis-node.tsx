'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import { NodeCoreComponent } from './node-core';
import { type OGOperationNode } from './og-models';

export function SynthesisNode(node: NodeProps<OGOperationNode>) {
  return (
    <>
      <Handle type='target' position={Position.Top} id='left' style={{ left: 40, top: -2 }} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto', top: -2 }} />
      <NodeCoreComponent node={node} />
      <Handle type='source' position={Position.Bottom} className='-translate-y-px' />
    </>
  );
}
