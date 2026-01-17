'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import { NodeCoreComponent } from './node-core';
import { type OGOperationNode } from './og-models';

export function SynthesisNode(node: NodeProps<OGOperationNode>) {
  return (
    <>
      <Handle type='target' position={Position.Top} id='left' style={{ left: 40 }} isConnectableStart={false} />
      <Handle type='target' position={Position.Top} id='right' style={{ right: 40, left: 'auto' }} isConnectableStart={false} />
      <NodeCoreComponent node={node} />
      <Handle type='source' position={Position.Bottom} isConnectableStart />
    </>
  );
}
